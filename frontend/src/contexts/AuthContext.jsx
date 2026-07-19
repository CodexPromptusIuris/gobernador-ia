import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

/**
 * AuthProvider: Manages user authentication state
 * - Checks for valid JWT token on mount
 * - Handles login/logout operations with error handling
 * - Provides auth context to protected routes
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Verify token hasn't expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({ 
            username: payload.sub, 
            role: payload.role,
            token 
          });
        } else {
          // Expired token - clear it
          localStorage.removeItem("token");
        }
      } catch (err) {
        // Invalid token - clear it
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login handler with error handling and retry logic
   */
  const login = async (password) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.login(password);
      
      if (!res.token) {
        throw new Error("No token received from server");
      }

      // Validate token structure before storing
      const payload = JSON.parse(atob(res.token.split(".")[1]));
      
      if (!payload.sub || !payload.role || !payload.exp) {
        throw new Error("Invalid token structure");
      }

      // Store token and update user state
      api.setToken(res.token);
      setUser({ 
        username: payload.sub, 
        role: payload.role,
        token: res.token 
      });
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Login failed";
      setError(errorMsg);
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout handler - clears token and user state
   */
  const logout = () => {
    api.clearToken();
    setUser(null);
    setError("");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
    clearError: () => setError("")
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
