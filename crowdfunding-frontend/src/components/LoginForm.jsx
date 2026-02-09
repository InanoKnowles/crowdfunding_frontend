    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import postLogin from "../api/post-login.js";
    import { useAuth } from "./AuthProvider.jsx";

    function LoginForm() {
    const navigate = useNavigate();
    const auth = useAuth();

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [status, setStatus] = useState({ state: "idle", message: "" });

    function handleChange(event) {
        const { id, value } = event.target;
        setCredentials((prev) => ({
        ...prev,
        [id]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus({ state: "submitting", message: "" });

        try {
        const response = await postLogin(credentials.username, credentials.password);
        auth.login(response.token, credentials.username);
        setStatus({ state: "idle", message: "" });
        navigate("/");
        } catch (err) {
        setStatus({ state: "error", message: err?.message || "Login failed." });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="username">Username:</label>
            <input
            type="text"
            id="username"
            value={credentials.username}
            placeholder="Enter username"
            onChange={handleChange}
            required
            disabled={status.state === "submitting"}
            />
        </div>

        <div>
            <label htmlFor="password">Password:</label>
            <input
            type="password"
            id="password"
            value={credentials.password}
            placeholder="Password"
            onChange={handleChange}
            required
            disabled={status.state === "submitting"}
            />
        </div>

        <button type="submit" disabled={status.state === "submitting"}>
            {status.state === "submitting" ? "Logging in…" : "Login"}
        </button>

        {status.state === "error" && <p>{status.message}</p>}
        </form>
    );
    }

    export default LoginForm;
