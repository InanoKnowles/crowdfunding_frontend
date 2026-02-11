    import { useState } from "react";
    import { useNavigate, Link } from "react-router-dom";
    import postLogin from "../api/post-login.js";
    import "./LoginForm.css";
    import { useAuth } from "/src/components/AuthProvider";

    function LoginForm() {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [status, setStatus] = useState({ state: "idle", message: "" });

    function handleChange(e) {
        const { id, value } = e.target;
        setCredentials((prev) => ({ ...prev, [id]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const username = credentials.username.trim();
        const password = credentials.password;

        if (!username || !password) {
        setStatus({ state: "error", message: "Please enter your username and password." });
        return;
        }

        setStatus({ state: "submitting", message: "" });

        try {
        const response = await postLogin(username, password);

        

        const { login } = useAuth();

        login(response.token, username);
        navigate("/");

        setStatus({ state: "success", message: "Logged in. Redirecting…" });
        navigate("/");
        } catch (err) {
        setStatus({ state: "error", message: err?.message || "Login failed. Please try again." });
        }
    }

    return (
        <main className="container section">
        <section className="authCard">
            <header className="authHeader">
            <h1 className="authTitle">Log in</h1>
            <p className="authSub">Welcome back. Please enter your details.</p>
            </header>

            <form className="authForm" onSubmit={handleSubmit} noValidate>
            <label className="authField" htmlFor="username">
                <span className="authLabel">Username</span>
                <input
                className="authInput"
                type="text"
                id="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter username"
                autoComplete="username"
                disabled={status.state === "submitting"}
                required
                />
            </label>

            <label className="authField" htmlFor="password">
                <span className="authLabel">Password</span>
                <input
                className="authInput"
                type="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                disabled={status.state === "submitting"}
                required
                />
            </label>

            <button
                className="button button--primary authButton"
                type="submit"
                disabled={status.state === "submitting"}
            >
                {status.state === "submitting" ? "Logging in…" : "Log in"}
            </button>

            {status.state !== "idle" && (
                <p
                className={
                    status.state === "success"
                    ? "formStatus formStatus--success"
                    : "formStatus formStatus--error"
                }
                role="status"
                >
                {status.message}
                </p>
            )}

            <p className="authFooter">
                Don’t have an account? <Link to="/signup">Create one</Link>
            </p>
            </form>
        </section>
        </main>
    );
    }

    export default LoginForm;
