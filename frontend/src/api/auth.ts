import api from "./api";

export interface AuthUser {
  id: number;
  profile_id: string;
  username: string;
  display_name: string;
  role: "Employee" | "Manager" | "CTO" | "COO" | "CEO";
  department: "Technology" | "Operations";
  manager_id?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface AuthSession {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
}

export const login = async (
  username: string,
  password: string,
): Promise<AuthSession> => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
