import { ApiResponse, PaginatedResponse } from "./types";

const API_URL = "https://memory-server-1lkr.onrender.com/api/v1";

// const API_URL = "http://localhost:4000/api/v1";

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      (headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          retryResponse.status,
          errorData.message || "Request failed",
          errorData
        );
      }
      return retryResponse.json();
    } else {
      // Logout — but don't redirect if already on an auth page
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");
      if (!isAuthPage) {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || "Request failed",
      errorData
    );
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (phone: string, password: string) =>
    fetchWithAuth<
      ApiResponse<{ user: unknown; accessToken: string; refreshToken: string }>
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),

  registerStudent: (formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>("/auth/register/student", {
      method: "POST",
      body: formData,
    }),

  registerTeacher: (formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>("/auth/register/teacher", {
      method: "POST",
      body: formData,
    }),

  logout: (refreshToken: string) =>
    fetchWithAuth<ApiResponse<unknown>>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  getMe: () => fetchWithAuth<ApiResponse<unknown>>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    fetchWithAuth<ApiResponse<unknown>>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  changePhone: (currentPassword: string, newPhone: string) =>
    fetchWithAuth<ApiResponse<unknown>>("/auth/change-phone", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPhone }),
    }),
};

// ─── Schools API ─────────────────────────────────────────────────────────────

export const schoolsApi = {
  getDropdown: () =>
    fetch(`${API_URL}/schools/dropdown`).then((r) => r.json()) as Promise<
      ApiResponse<
        { id: string; name: string; district: string; logo?: string }[]
      >
    >,

  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchWithAuth<PaginatedResponse<unknown>>(`/schools${query}`);
  },

  getOne: (id: string) => fetchWithAuth<ApiResponse<unknown>>(`/schools/${id}`),

  create: (formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>("/schools", {
      method: "POST",
      body: formData,
    }),

  update: (id: string, formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>(`/schools/${id}`, {
      method: "PATCH",
      body: formData,
    }),

  toggleActive: (id: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/schools/${id}/toggle-active`, {
      method: "PATCH",
    }),
};

// ─── Students API ────────────────────────────────────────────────────────────

export const studentsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchWithAuth<PaginatedResponse<unknown>>(`/students${query}`);
  },

  getBatches: () => fetchWithAuth<ApiResponse<unknown>>("/students/batches"),

  getByBatch: (year: number, params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchWithAuth<PaginatedResponse<unknown>>(
      `/students/batch/${year}${query}`
    );
  },

  getOne: (userId: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/students/${userId}`),

  updateProfile: (userId: string, data: Record<string, unknown>) =>
    fetchWithAuth<ApiResponse<unknown>>(`/students/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateImage: (userId: string, formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>(`/students/${userId}/image`, {
      method: "PATCH",
      body: formData,
    }),
};

// ─── Teachers API ────────────────────────────────────────────────────────────

export const teachersApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchWithAuth<PaginatedResponse<unknown>>(`/teachers${query}`);
  },

  getOne: (userId: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/teachers/${userId}`),

  updateProfile: (userId: string, data: Record<string, unknown>) =>
    fetchWithAuth<ApiResponse<unknown>>(`/teachers/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateImage: (userId: string, formData: FormData) =>
    fetchWithAuth<ApiResponse<unknown>>(`/teachers/${userId}/image`, {
      method: "PATCH",
      body: formData,
    }),
};

export { ApiError };

// ─── Admin Users API ──────────────────────────────────────────────────────────

export const adminUsersApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchWithAuth<PaginatedResponse<unknown>>(`/users${query}`);
  },

  getOne: (userId: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/users/${userId}`),

  updateStudent: (userId: string, data: Record<string, unknown>) =>
    fetchWithAuth<ApiResponse<unknown>>(`/users/${userId}/student`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateTeacher: (userId: string, data: Record<string, unknown>) =>
    fetchWithAuth<ApiResponse<unknown>>(`/users/${userId}/teacher`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  toggleActive: (userId: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/users/${userId}/toggle-active`, {
      method: "PATCH",
    }),

  delete: (userId: string) =>
    fetchWithAuth<ApiResponse<unknown>>(`/users/${userId}`, {
      method: "DELETE",
    }),

  getStats: () => fetchWithAuth<ApiResponse<unknown>>("/users/stats"),
};
