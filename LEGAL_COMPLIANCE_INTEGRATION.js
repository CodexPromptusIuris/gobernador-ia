// 🔒 INTEGRATED LEGAL COMPLIANCE SYSTEM
// Add these modules to your existing LegalAgentDashboard.jsx

export const LEGAL_COMPLIANCE_MODULES = {
  contracts: {
    name: "Contract Analysis",
    icon: "📄",
    description: "AI-powered contract review & compliance scoring"
  },
  dataProtection: {
    name: "Data Protection",
    icon: "🛡️",
    description: "Personal data handling & GDPR compliance"
  },
  traceability: {
    name: "Audit & Traceability",
    icon: "📡",
    description: "Data access logs & compliance tracking"
  },
  subjectRights: {
    name: "Subject Rights",
    icon: "✦",
    description: "Data access/deletion requests management"
  },
  incidents: {
    name: "Incident Response",
    icon: "🚨",
    description: "Data breach notification & remediation"
  },
  reporting: {
    name: "Compliance Reports",
    icon: "📊",
    description: "Daily/monthly compliance metrics"
  }
};

export const QUICK_COMPLIANCE_CHECKS = [
  // Ley 21.719 Checks
  {
    id: "ley21719_consent",
    framework: "LEY_21719",
    check: "Do you have explicit consent for data processing?",
    article: "Art. 12°",
    required: true
  },
  {
    id: "ley21719_security",
    framework: "LEY_21719",
    check: "Are security measures documented (encryption, access control)?",
    article: "Art. 14°",
    required: true
  },
  {
    id: "ley21719_audit",
    framework: "LEY_21719",
    check: "Are data access events logged and retained?",
    article: "Art. 14°",
    required: true
  },
  {
    id: "ley21719_rights",
    framework: "LEY_21719",
    check: "Do you have a process for subject rights requests (30-day SLA)?",
    article: "Art. 5-9°",
    required: true
  },
  {
    id: "ley21719_retention",
    framework: "LEY_21719",
    check: "Is data retention period defined?",
    article: "Art. 3° (Proporcionality)",
    required: true
  },
  {
    id: "ley21719_breach",
    framework: "LEY_21719",
    check: "Do you have incident notification procedures?",
    article: "Art. 35°",
    required: true
  },
  // GDPR Checks
  {
    id: "gdpr_dpia",
    framework: "GDPR",
    check: "Is Data Protection Impact Assessment completed for high-risk processing?",
    article: "Art. 35°",
    required: false
  },
  {
    id: "gdpr_dpo",
    framework: "GDPR",
    check: "Is a Data Protection Officer appointed?",
    article: "Art. 37°",
    required: false
  },
  // CCPA Checks
  {
    id: "ccpa_disclosure",
    framework: "CCPA",
    check: "Is privacy notice provided at collection?",
    required: true
  },
  {
    id: "ccpa_rights",
    framework: "CCPA",
    check: "Can consumers delete, know, and opt-out of sale?",
    required: true
  }
];

export const COMPLIANCE_RESOURCES = {
  LEY_21719: {
    url: "https://www.bcn.cl/leyes/pdf/2024/2024-21719.pdf",
    documents: [
      "Privacy Policy Template",
      "Data Processing Agreement",
      "Incident Response Plan",
      "Subject Rights Procedure"
    ]
  },
  GDPR: {
    url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    documents: [
      "DPIA Template",
      "Processing Record (ROPA)",
      "Data Processing Agreement",
      "Breach Notification Template"
    ]
  },
  CCPA: {
    url: "https://oag.ca.gov/privacy/ccpa",
    documents: [
      "Privacy Notice Template",
      "Opt-out Mechanism",
      "Consumer Rights Form"
    ]
  }
};

// Integration example - Add to your main dashboard component

export const ComplianceIntegration = () => {
  const [activeComplianceModule, setActiveComplianceModule] = useState("contracts");
  const [complianceScore, setComplianceScore] = useState(0);
  const [criticalIssues, setCriticalIssues] = useState([]);

  const analyzeDocumentForCompliance = async (documentText, framework = "LEY_21719") => {
    try {
      const response = await axios.post("http://localhost:3001/llm/generate", {
        prompt: `Analyze this legal document for ${framework} compliance:
        
${documentText}

Provide JSON response:
{
  "compliance_score": 0-100,
  "status": "COMPLIANT|PARTIAL|NON_COMPLIANT",
  "critical_issues": [],
  "recommendations": []
}`,
        task: "legal-compliance-analysis"
      });

      const result = JSON.parse(response.data.response);
      setComplianceScore(result.compliance_score);
      setCriticalIssues(result.critical_issues);
      
      return result;
    } catch (error) {
      console.error("Compliance analysis failed:", error);
    }
  };

  const createSubjectRightsRequest = async (subjectId, requestType) => {
    try {
      const response = await axios.post("http://localhost:8080/api/legal/subject-rights", {
        subject_id: subjectId,
        request_type: requestType, // ACCESS, RECTIFICATION, DELETION
        description: `${requestType} request from ${subjectId}`
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create subject rights request:", error);
    }
  };

  const logDataAccess = async (userId, action, dataType, recordsCount) => {
    try {
      const response = await axios.post("http://localhost:8080/api/legal/audit/log", {
        user_id: userId,
        action, // READ, WRITE, DELETE, EXPORT
        data_type: dataType,
        affected_records: recordsCount,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error("Failed to log data access:", error);
    }
  };

  const generateComplianceReport = async (framework = "LEY_21719") => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/legal/reports?framework=${framework}&period=month`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return {
    analyzeDocumentForCompliance,
    createSubjectRightsRequest,
    logDataAccess,
    generateComplianceReport,
    complianceScore,
    criticalIssues,
    activeComplianceModule,
    setActiveComplianceModule
  };
};

// Usage in your existing LegalAgentDashboard:
// const compliance = ComplianceIntegration();
// 
// Then use:
// - compliance.analyzeDocumentForCompliance(text, "LEY_21719")
// - compliance.createSubjectRightsRequest(userId, "ACCESS")
// - compliance.logDataAccess(userId, "READ", "personal_data", 100)
// - compliance.generateComplianceReport("LEY_21719")
