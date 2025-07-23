const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage as fallback
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers with authentication
const createHeaders = (additionalHeaders: Record<string, string> = {}, isFormData = false) => {
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  // Don't set Content-Type for FormData - let browser set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if token exists in localStorage
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function for fetch with proper credentials and headers
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Always include cookies
    headers: createHeaders(options.headers as Record<string, string>, isFormData),
    ...options,
  };

  return fetch(url, defaultOptions);
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Save token to localStorage if provided in response
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  logout: async () => {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    
    // Optionally call logout endpoint if it exists
    try {
      await apiRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout endpoint errors
      console.warn('Logout endpoint error:', error);
    }
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/projects`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data.data || [];
  },

  create: async (project: { name: string; description: string; thumbnail: string; demoLink: string; sourceCodeLink: string } | FormData) => {
    const body = project instanceof FormData ? project : JSON.stringify(project);
    
    const response = await apiRequest(`${API_BASE_URL}/portfolio/projects`, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return response.json();
  },

  update: async (id: string, project: { name: string; description: string; thumbnail: string; demoLink: string; sourceCodeLink: string } | FormData) => {
    const body = project instanceof FormData ? project : JSON.stringify(project);
    
    const response = await apiRequest(`${API_BASE_URL}/portfolio/projects/${id}`, {
      method: 'PUT',
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return response.json();
  },
};

// Skills API
export const skillsAPI = {
  getAll: async () => {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/skills`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }

    const data = await response.json();
    return data.data || [];
  },

  create: async (skill: { name: string; image: string } | FormData) => {
    const body = skill instanceof FormData ? skill : JSON.stringify(skill);
    
    const response = await apiRequest(`${API_BASE_URL}/portfolio/skills`, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to create skill');
    }

    return response.json();
  },

  update: async (id: string, skill: { name: string; image: string } | FormData) => {
    const body = skill instanceof FormData ? skill : JSON.stringify(skill);
    
    const response = await apiRequest(`${API_BASE_URL}/portfolio/skills/${id}`, {
      method: 'PUT',
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update skill');
    }

    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/skills/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete skill');
    }

    return response.json();
  },
};

// Messages API
export const messagesAPI = {
  getAll: async () => {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/contact`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.data || [];
  },
};

// URL Shortener API
export const urlAPI = {
  getAll: async (page: number = 1, limit: number = 20) => {
    const response = await apiRequest(`${API_BASE_URL}/url?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }

    const result = await response.json();
    
    // Handle the new response format with nested data structure
    if (result.success && result.data) {
      const urlsData = result.data.urls || [];
      const paginationData = result.data.pagination || {};
      
      return {
        data: Array.isArray(urlsData) ? urlsData : [],
        pagination: {
          currentPage: paginationData.currentPage || page,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalUrls || urlsData.length,
          hasNext: paginationData.hasNextPage || false,
          hasPrev: paginationData.hasPrevPage || false
        }
      };
    }
    
    // Fallback for direct array response (legacy support)
    const data = Array.isArray(result) ? result : [];
    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: data.length,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  create: async (url: { fullUrl: string }) => {
    const response = await apiRequest(`${API_BASE_URL}/url`, {
      method: 'POST',
      body: JSON.stringify(url),
    });

    if (!response.ok) {
      throw new Error('Failed to create short URL');
    }

    return response.json();
  },

  update: async (id: string, url: { fullUrl: string; shortCode: string }) => {
    const response = await apiRequest(`${API_BASE_URL}/url/${id}`, {
      method: 'PUT',
      body: JSON.stringify(url),
    });

    if (!response.ok) {
      throw new Error('Failed to update URL');
    }

    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest(`${API_BASE_URL}/url/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete URL');
    }

    return response.json();
  },
};
