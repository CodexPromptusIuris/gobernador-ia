use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::Utc;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use std::sync::OnceLock;
use uuid::Uuid;

use crate::auth::{generate_token, ApiKeyAuth, AuthUser};
use crate::error::AppError;
use crate::models::*;
use crate::risk::evaluate_risk;
use crate::AppState;

// ─── Simple in-memory rate limiter ────────────────────────────────────────────
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;

fn rate_limiter() -> &'static Mutex<HashMap<String, Vec<Instant>>> {
    static INSTANCE: OnceLock<Mutex<HashMap<String, Vec<Instant>>>> = OnceLock::new();
    INSTANCE.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Returns true if the request is allowed (max 5 attempts per minute).
fn check_rate_limit(key: &str) -> bool {
    let now = Instant::now();
    let mut attempts = rate_limiter().lock().unwrap();
    let entry = attempts.entry(key.to_string()).or_default();
    entry.retain(|t| now.duration_since(*t).as_secs() < 60);
    if entry.len() >= 5 {
        return false;
    }
    entry.push(now);
    true
}

// ─── Struct para leer filas de la BD ──────────────────────────────────────────
#[derive(sqlx::FromRow)]
struct AuditRow {
    case_id: String,
    risk_level: String,
    risk_score: i32,
    risk_factors: String,
    document_hash: String,
    trace_id: String,
    status: String,
    requires_hitl: bool,
    reviewed_by: Option<String>,
    reviewed_at: Option<chrono::DateTime<Utc>>,
    review_notes: Option<String>,
    created_at: chrono::DateTime<Utc>,
}

fn row_to_dto(r: AuditRow) -> AuditRecordDto {
    let factors: Vec<String> = serde_json::from_str(&r.risk_factors).unwrap_or_default();
    AuditRecordDto {
        case_id: r.case_id,
        risk_level: r.risk_level,
        risk_score: r.risk_score,
        risk_factors: factors,
        document_hash: r.document_hash,
        trace_id: r.trace_id,
        status: r.status,
        requires_hitl: r.requires_hitl,
        reviewed_by: r.reviewed_by,
        reviewed_at: r.reviewed_at.map(|d| d.to_rfc3339()),
        review_notes: r.review_notes,
        created_at: r.created_at.to_rfc3339(),
    }
}

// ─── Login ─────────────────────────────────────────────────────────────────────
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    // Rate limit: max 5 attempts per minute per origin
    if !check_rate_limit("login") {
        return Err(AppError::TooManyRequests);
    }

    if !crate::auth::constant_time_eq(&body.password, &state.admin_password) {
        return Err(AppError::Unauthorized);
    }

    let token = generate_token(&state.jwt_secret, "admin", "reviewer")
        .map_err(|_| AppError::Internal("Error al generar token".into()))?;

    Ok(Json(LoginResponse { token, role: "reviewer".into() }))
}

// ─── Estadísticas ──────────────────────────────────────────────────────────────
pub async fn get_stats(
    _auth: AuthUser,
    State(state): State<AppState>,
) -> Result<Json<StatsResponse>, AppError> {
    let rows: Vec<AuditRow> = sqlx::query_as::<_, AuditRow>(
        "SELECT case_id, risk_level, risk_score, risk_factors, document_hash,
                trace_id, status, requires_hitl, reviewed_by, reviewed_at,
                review_notes, created_at
         FROM audit_trail WHERE status = 'pending_hitl'"
    )
    .fetch_all(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    let mut critical = 0usize;
    let mut high = 0usize;
    let mut medium = 0usize;
    let mut low = 0usize;

    for r in &rows {
        match r.risk_level.as_str() {
            "Critical" => critical += 1,
            "High"     => high     += 1,
            "Medium"   => medium   += 1,
            _          => low      += 1,
        }
    }

    Ok(Json(StatsResponse { total_pending: rows.len(), critical, high, medium, low }))
}

// ─── Listado paginado pending-HITL ────────────────────────────────────────────
pub async fn get_pending_hitl(
    _auth: AuthUser,
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedResponse<AuditRecordDto>>, AppError> {
    let page     = params.page.unwrap_or(1).max(1) as i64;
    let per_page = params.per_page.unwrap_or(20).min(100) as i64;
    let skip     = (page - 1) * per_page;

    let total: i64 = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM audit_trail WHERE status = 'pending_hitl'"
    )
    .fetch_one(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    let rows: Vec<AuditRow> = sqlx::query_as::<_, AuditRow>(
        "SELECT case_id, risk_level, risk_score, risk_factors, document_hash,
                trace_id, status, requires_hitl, reviewed_by, reviewed_at,
                review_notes, created_at
         FROM audit_trail WHERE status = 'pending_hitl'
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2"
    )
    .bind(per_page)
    .bind(skip)
    .fetch_all(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    let total_pages = ((total as f64) / (per_page as f64)).ceil() as u64;
    let data: Vec<AuditRecordDto> = rows.into_iter().map(row_to_dto).collect();

    Ok(Json(PaginatedResponse {
        data,
        total: total as usize,
        page: page as u64,
        per_page: per_page as u64,
        total_pages,
    }))
}

// ─── Obtener registro individual ───────────────────────────────────────────────
pub async fn get_audit_record(
    _auth: AuthUser,
    State(state): State<AppState>,
    Path(trace_id): Path<String>,
) -> Result<Json<AuditRecordDto>, AppError> {
    let row: Option<AuditRow> = sqlx::query_as::<_, AuditRow>(
        "SELECT case_id, risk_level, risk_score, risk_factors, document_hash,
                trace_id, status, requires_hitl, reviewed_by, reviewed_at,
                review_notes, created_at
         FROM audit_trail WHERE trace_id = $1"
    )
    .bind(&trace_id)
    .fetch_optional(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    Ok(Json(row_to_dto(row.ok_or(AppError::NotFound)?)))
}

// ─── Revisar caso HITL ────────────────────────────────────────────────────────
pub async fn submit_review(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(trace_id): Path<String>,
    Json(body): Json<ReviewRequest>,
) -> Result<Json<ReviewResponse>, AppError> {
    let new_status = match body.action.as_str() {
        "approve"         => "approved",
        "reject"          => "rejected",
        "request_changes" => "changes_requested",
        _ => return Err(AppError::BadRequest(
            "Acción inválida. Use: approve, reject, request_changes".into()
        )),
    };

    if new_status == "rejected" && body.notes.as_deref().unwrap_or("").trim().is_empty() {
        return Err(AppError::BadRequest(
            "Las notas son obligatorias al rechazar un caso".into()
        ));
    }

    let existing_status: Option<String> = sqlx::query_scalar::<_, String>(
        "SELECT status FROM audit_trail WHERE trace_id = $1"
    )
    .bind(&trace_id)
    .fetch_optional(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    match existing_status.as_deref() {
        None                 => return Err(AppError::NotFound),
        Some("pending_hitl") => {}
        Some(s)              => return Err(AppError::Conflict(
            format!("El caso ya fue revisado con estado: {}", s)
        )),
    }

    let now = Utc::now();

    sqlx::query(
        "UPDATE audit_trail
         SET status = $1, reviewed_by = $2, reviewed_at = $3, review_notes = $4
         WHERE trace_id = $5"
    )
    .bind(new_status)
    .bind(&auth.claims.sub)
    .bind(now)
    .bind(&body.notes)
    .bind(&trace_id)
    .execute(state.db_pool.as_ref())
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    Ok(Json(ReviewResponse {
        trace_id,
        new_status: new_status.to_string(),
        reviewed_by: auth.claims.sub,
    }))
}

// ─── Subir documento (Frontend - JWT Auth) ───────────────────────────────────
pub async fn upload_document(
    _auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<AgentPayload>,
) -> Result<Json<WebhookResponse>, AppError> {
    process_document(state.db_pool.as_ref(), payload).await
}

// ─── Webhook de agente (API Key Auth) ────────────────────────────────────────
pub async fn handle_agent_webhook(
    _api_key: ApiKeyAuth,
    State(state): State<AppState>,
    Json(payload): Json<AgentPayload>,
) -> Result<Json<WebhookResponse>, AppError> {
    process_document(state.db_pool.as_ref(), payload).await
}

// ─── Procesar documento (compartido entre webhooks y upload) ──────────────────
async fn process_document(
    pool: &PgPool,
    payload: AgentPayload,
) -> Result<Json<WebhookResponse>, AppError> {
    if payload.case_id.trim().is_empty() {
        return Err(AppError::BadRequest("case_id no puede estar vacío".into()));
    }
    if payload.document_content.trim().is_empty() {
        return Err(AppError::BadRequest("document_content no puede estar vacío".into()));
    }
    if payload.ai_risk_level.trim().is_empty() {
        return Err(AppError::BadRequest("ai_risk_level no puede estar vacío".into()));
    }

    let mut hasher = Sha256::new();
    hasher.update(payload.document_content.as_bytes());
    let document_hash = format!("{:x}", hasher.finalize());

    let trace_id   = format!("trc_{}", Uuid::new_v4().simple());
    let assessment = evaluate_risk(&payload.document_content, &payload.ai_risk_level);
    let status     = if assessment.requires_hitl { "pending_hitl" } else { "approved" };
    let factors_json = serde_json::to_string(&assessment.factors).unwrap_or_else(|_| "[]".into());

    sqlx::query(
        "INSERT INTO audit_trail
             (case_id, risk_level, risk_score, risk_factors, document_hash,
              trace_id, status, requires_hitl)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
    )
    .bind(&payload.case_id)
    .bind(assessment.level.as_str())
    .bind(assessment.score as i32)
    .bind(&factors_json)
    .bind(&document_hash)
    .bind(&trace_id)
    .bind(status)
    .bind(assessment.requires_hitl)
    .execute(pool)
    .await
    .map_err(|e| AppError::Database(e.to_string()))?;

    tracing::info!(
        "Caso {} persistido. Riesgo: {} ({}). Estado: {}",
        payload.case_id, assessment.level.as_str(), assessment.score, status
    );

    Ok(Json(WebhookResponse {
        status: status.to_string(),
        document_hash,
        trace_id,
        requires_hitl: assessment.requires_hitl,
        risk_score: assessment.score,
        risk_factors: assessment.factors,
    }))
}
