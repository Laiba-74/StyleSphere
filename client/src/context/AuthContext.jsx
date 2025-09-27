import { createContext, useContext, useEffect, useState } from "react";
import { FetchUser, loginUser, registerUser } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const isLoggedIn = !!token;

  const storeToken = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const Logoutuser = () => {
    removeToken();
    setUser(null);
    setRole("user");
  };

  const authenticateuser = async () => {
    try {
      const res = await FetchUser();
      setUser(res.data.user);
      console.log(res.data.user)
      setRole(res.data.user.role);
    } catch (error) {
      console.error("Auth error:", error);
      Logoutuser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      authenticateuser();
    } else {
      setUser(null);
      setLoading(false)
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        setUser,
        role,
        setRole,
        storeToken,
        Logoutuser,
        authenticateuser,
        loginUser,
        registerUser,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextvalue = useContext(AuthContext);
  if (!authContextvalue) {
    throw new Error("Auth Provider must wrap your app in main.jsx");
  }
  return authContextvalue;
};
