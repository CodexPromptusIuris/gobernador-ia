use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    Unauthorized,
    Forbidden,
    BadRequest(String),
    NotFound,
    Conflict(String),
    Internal(String),
    Database(String),
    TooManyRequests,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "No autorizado".to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "Prohibido".to_string()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Recurso no encontrado".to_string()),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
            AppError::Internal(msg) => {
                tracing::error!("Error interno: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, "Error interno del servidor".to_string())
            }
            AppError::Database(msg) => {
                tracing::error!("Error de base de datos: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, "Error de persistencia".to_string())
            }
            AppError::TooManyRequests => (
                StatusCode::TOO_MANY_REQUESTS,
                "Demasiadas solicitudes. Intenta de nuevo en un minuto.".to_string(),
            ),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}
