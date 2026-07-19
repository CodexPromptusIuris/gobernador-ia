mod auth;
mod error;
mod handlers;
mod models;
mod risk;

use axum::{
    http::StatusCode,
    routing::{get, post},
    Router,
};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use std::{net::SocketAddr, str::FromStr, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    cors::{AllowOrigin, CorsLayer},
    trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer},
};
use tracing::{error, info, warn, Level};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

pub type DbPool = Arc<sqlx::PgPool>;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: DbPool,
    pub jwt_secret: String,
    pub admin_password: String,
    pub webhook_api_key: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("gobernador_ia=info,tower_http=debug"));

    tracing_subscriber::registry()
        .with(fmt::layer().with_writer(std::io::stdout))
        .with(env_filter)
        .init();

    info!("🚀 BRO PARTNER 2.0 - Starting...");

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL required");

    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET required (min 32 chars)");
    if jwt_secret.len() < 32 {
        error!("JWT_SECRET must be at least 32 characters");
        std::process::exit(1);
    }

    let admin_password = std::env::var("ADMIN_PASSWORD")
        .expect("ADMIN_PASSWORD required");
    if admin_password == "ChangeMe@123" || admin_password.is_empty() {
        warn!("⚠️  ADMIN_PASSWORD is default or empty — change it for production!");
    }

    let webhook_api_key = std::env::var("WEBHOOK_API_KEY")
        .unwrap_or_default();

    let connect_options = PgConnectOptions::from_str(&database_url)
        .expect("Invalid DATABASE_URL");

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(30))
        .idle_timeout(Some(Duration::from_secs(600)))
        .max_lifetime(Some(Duration::from_secs(1800)))
        .connect_with(connect_options)
        .await
        .expect("Database connection failed");

    info!("📊 Running migrations...");
    if let Err(e) = sqlx::migrate!("./migrations").run(&pool).await {
        error!("Migration error: {}", e);
        std::process::exit(1);
    }

    info!("✅ Database ready");

    let app_state = AppState {
        db_pool: Arc::new(pool),
        jwt_secret,
        admin_password,
        webhook_api_key,
    };

    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());

    let origin = AllowOrigin::exact(
        frontend_url.parse::<axum::http::HeaderValue>().expect("Invalid FRONTEND_URL"),
    );

    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            "X-API-Key".parse().unwrap(),
        ])
        .allow_credentials(true);

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/auth/login", post(handlers::login))
        .route("/api/stats", get(handlers::get_stats))
        .route("/api/pending-hitl", get(handlers::get_pending_hitl))
        .route("/api/audit/:trace_id", get(handlers::get_audit_record))
        .route("/api/review/:trace_id", post(handlers::submit_review))
        .route("/api/documents/upload", post(handlers::upload_document))
        .route("/api/webhooks/audit-agent", post(handlers::handle_agent_webhook))
        .layer(
            ServiceBuilder::new()
                .layer(
                    TraceLayer::new_for_http()
                        .make_span_with(DefaultMakeSpan::new().level(Level::DEBUG))
                        .on_response(DefaultOnResponse::new().level(Level::DEBUG)),
                )
                .layer(cors),
        )
        .with_state(app_state)
        .fallback(handle_404);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    info!("🌐 Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}

async fn health_check() -> (StatusCode, &'static str) {
    (StatusCode::OK, "BRO PARTNER v2.0 ✅")
}

async fn handle_404() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Not found")
}
