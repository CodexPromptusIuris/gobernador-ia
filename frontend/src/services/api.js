class ApiService {
  constructor() {
    this.token = localStorage.getItem("token");
    // Use environment or fallback to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  async request(path, options = {}) {
    const url = this.baseUrl + path;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });

      if (res.status === 401) {
        this.clearToken();
        window.location.href = "/login";
        throw new Error("Sesión expirada");
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error HTTP ${res.status}`);
      }

      return res.json();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(`API Error [${path}]:`, err.message);
      }
      throw err;
    }
  }

  login(password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  getStats() {
    return this.request("/api/stats");
  }

  getPendingHitl(page = 1, perPage = 20) {
    return this.request(`/api/pending-hitl?page=${page}&per_page=${perPage}`);
  }

  getAuditRecord(traceId) {
    return this.request(`/api/audit/${traceId}`);
  }

  submitReview(traceId, action, notes = "") {
    return this.request(`/api/review/${traceId}`, {
      method: "POST",
      body: JSON.stringify({ action, notes: notes || null }),
    });
  }
}

export const api = new ApiService();
