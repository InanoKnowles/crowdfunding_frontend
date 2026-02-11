    import { useState } from "react";
    import { useNavigate, Link } from "react-router-dom";
    import postSignup from "../api/post-signup.js";
    import postLogin from "../api/post-login.js";
    import "./SignupForm.css";

    function SignupForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [status, setStatus] = useState({ state: "idle", message: "" });

    function handleChange(e) {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const username = form.username.trim();
        const email = form.email.trim();
        const password = form.password;

        if (!username || !email || !password) {
        setStatus({ state: "error", message: "Please fill in all fields." });
        return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
        setStatus({ state: "error", message: "Please enter a valid email." });
        return;
        }

        if (password.length < 8) {
        setStatus({ state: "error", message: "Password must be at least 8 characters." });
        return;
        }

        setStatus({ state: "submitting", message: "" });

        try {
        await postSignup(username, email, password);

        const loginResponse = await postLogin(username, password);
        window.localStorage.setItem("token", loginResponse.token);
        window.localStorage.setItem("username", username);

        setStatus({ state: "success", message: "Account created. Logging you in…" });
        navigate("/");
        } catch (err) {
        setStatus({ state: "error", message: err?.message || "Signup failed. Please try again." });
        }
    }

    return (
        <main className="container section">
        <section className="authCard">
            <header className="authHeader">
            <h1 className="authTitle">Sign up</h1>
            <p className="authSub">Create your account in a few seconds.</p>
            </header>

            <form className="authForm" onSubmit={handleSubmit} noValidate>
            <label className="authField" htmlFor="username">
                <span className="authLabel">Username</span>
                <input
                className="authInput"
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                autoComplete="username"
                disabled={status.state === "submitting"}
                required
                />
            </label>

            <label className="authField" htmlFor="email">
                <span className="authLabel">Email</span>
                <input
                className="authInput"
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={status.state === "submitting"}
                required
                />
            </label>

            <label className="authField" htmlFor="password">
                <span className="authLabel">Password</span>
                <input
                className="authInput"
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={status.state === "submitting"}
                required
                />
            </label>

            <button
                className="button button--primary authButton"
                type="submit"
                disabled={status.state === "submitting"}
            >
                {status.state === "submitting" ? "Creating…" : "Create account"}
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
                Already have an account? <Link to="/login">Log in</Link>
            </p>
            </form>
        </section>
        </main>
    );
    }

    export default SignupForm;
