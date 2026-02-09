import { useState, useEffect } from "react";

export default function useAuth() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username"));

    useEffect(() => {
        setToken(localStorage.getItem("token"));
        setUsername(localStorage.getItem("username"));
    }, []);

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

    return { token, username, login, logout };
}
