    import { createContext, useContext, useState } from "react";

    const AuthContext = createContext(null);

    function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username"));

    function login(tokenValue, usernameValue) {
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("username", usernameValue);
        setToken(tokenValue);
        setUsername(usernameValue);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setToken(null);
        setUsername(null);
    }

    const value = {
        token,
        username,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    }

    function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
    }

    export { AuthProvider, useAuth };
