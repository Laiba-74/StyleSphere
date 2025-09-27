import api from "./api";

// Register
export const registerUser = (data, role = "user") =>
  api.post("/auth/register", { ...data, role });

// Login
export const loginUser = (data, role = "user") =>
  api.post("/auth/login", { ...data, role });

export const FetchUser = () => api.get("/auth/profile");

export const UpdateUser = (userId, data) => api.patch(`/auth/userupdate/${userId}`, data,{
  headers: { "Content-Type": "multipart/form-data" },
});

export const getUserCount = () => api.get("/auth/count");

export const changePassword = (data) => api.put("/auth/change-pass", data);

export const getAllUsers = () => api.get("/auth");

export const deleteUser = (userId) => api.delete(`/auth/delete/${userId}`)

export const statusUpdate = (userId, newStatus) => api.put(`/auth/status/${userId}`, { status: newStatus })
// export const fetchUser = () => api.get("/auth/me");
