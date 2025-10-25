// Helper function for API requests that handles auth errors
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    // Add token to headers if it exists
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        // Handle 401 Unauthorized errors
        if (response.status === 401) {
            console.error("Authentication failed. Redirecting to login...");
            redirectToLogin();
            throw new Error("Authentication failed. Please login again.");
        }

        return response;
    } catch (error) {
        if (error.message === "Authentication failed. Please login again.") {
            // Already handled
            throw error;
        }

        console.error("API request error:", error);
        throw error;
    }
};

// Modify each route to accept options for public access
export const fetchData = async (endpoint, needsAuth = true) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    try {
        // For public endpoints, use regular fetch
        if (!needsAuth) {
            const response = await fetch(`${API_BASE}/${endpoint}`);
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            return await response.json();
        }

        // For protected endpoints, use fetchWithAuth
        const response = await fetchWithAuth(`${API_BASE}/${endpoint}`);
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

const redirectToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page if not already there
    if (window.location.pathname !== '/login') {
        window.location.href = "/login";
    }
};
