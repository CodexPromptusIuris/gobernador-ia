use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct LoginRequest {
    pub password: String,
}

#[derive(Deserialize, Debug)]
pub struct AgentPayload {
    pub case_id: String,
    pub document_content: String,
    pub ai_risk_level: String,
}

#[derive(Deserialize, Debug)]
pub struct ReviewRequest {
    pub action: String,
    pub notes: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct PaginationParams {
    pub page: Option<u64>,
    pub per_page: Option<u64>,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub role: String,
}

#[derive(Serialize)]
pub struct WebhookResponse {
    pub status: String,
    pub document_hash: String,
    pub trace_id: String,
    pub requires_hitl: bool,
    pub risk_score: u8,
    pub risk_factors: Vec<String>,
}

#[derive(Serialize, Clone)]
pub struct AuditRecordDto {
    pub case_id: String,
    pub risk_level: String,
    pub risk_score: i32,
    pub risk_factors: Vec<String>,
    pub document_hash: String,
    pub trace_id: String,
    pub status: String,
    pub requires_hitl: bool,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<String>,
    pub review_notes: Option<String>,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T: Serialize> {
    pub data: Vec<T>,
    pub total: usize,
    pub page: u64,
    pub per_page: u64,
    pub total_pages: u64,
}

#[derive(Serialize)]
pub struct ReviewResponse {
    pub trace_id: String,
    pub new_status: String,
    pub reviewed_by: String,
}

#[derive(Serialize)]
pub struct StatsResponse {
    pub total_pending: usize,
    pub critical: usize,
    pub high: usize,
    pub medium: usize,
    pub low: usize,
}
