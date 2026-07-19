use serde::Serialize;

#[derive(Debug, Serialize, Clone, PartialEq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

impl RiskLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            RiskLevel::Low => "Low",
            RiskLevel::Medium => "Medium",
            RiskLevel::High => "High",
            RiskLevel::Critical => "Critical",
        }
    }
}

#[derive(Debug, Serialize)]
pub struct RiskAssessment {
    pub level: RiskLevel,
    pub score: u8,
    pub factors: Vec<String>,
    pub requires_hitl: bool,
}

const HIGH_RISK_KEYWORDS: &[&str] = &[
    "delete", "eliminar", "borrar", "drop table", "override", "anular",
    "bypass", "evadir", "critical", "crítico", "urgente", "irreversible",
    "permanente", "confidencial", "clasificado", "financial", "financiero",
    "legal", "regulatorio", "eliminar datos", "borrado masivo",
];

pub fn evaluate_risk(content: &str, declared_risk: &str) -> RiskAssessment {
    let mut score: f64 = 0.0;
    let mut factors = Vec::new();

    let declared = declared_risk.to_lowercase();
    if declared.contains("critical") || declared.contains("crítico") {
        score += 4.0;
        factors.push("Nivel declarado: Crítico".into());
    } else if declared.contains("high") || declared.contains("alto") {
        score += 3.0;
        factors.push("Nivel declarado: Alto".into());
    } else if declared.contains("medium") || declared.contains("medio") {
        score += 1.5;
        factors.push("Nivel declarado: Medio".into());
    } else {
        factors.push("Nivel declarado: Bajo".into());
    }

    let len = content.len();
    if len > 50_000 {
        score += 2.5;
        factors.push(format!("Documento extenso: {} caracteres", len));
    } else if len > 10_000 {
        score += 1.0;
        factors.push(format!("Documento mediano: {} caracteres", len));
    }

    let content_lower = content.to_lowercase();
    let hits: Vec<&str> = HIGH_RISK_KEYWORDS
        .iter()
        .filter(|kw| content_lower.contains(*kw))
        .copied()
        .collect();

    if hits.len() >= 5 {
        score += 3.0;
        factors.push(format!("{} palabras clave de alto riesgo detectadas", hits.len()));
    } else if hits.len() >= 2 {
        score += 1.5;
        factors.push(format!("{} palabras clave de riesgo detectadas", hits.len()));
    } else if hits.len() == 1 {
        score += 0.5;
        factors.push("1 palabra clave de riesgo detectada".into());
    }

    let final_score = (score as i32).clamp(0, 10) as u8;
    let level = match final_score {
        8..=10 => RiskLevel::Critical,
        5..=7 => RiskLevel::High,
        3..=4 => RiskLevel::Medium,
        _ => RiskLevel::Low,
    };

    let requires_hitl = matches!(level, RiskLevel::High | RiskLevel::Critical);

    RiskAssessment { level, score: final_score, factors, requires_hitl }
}
