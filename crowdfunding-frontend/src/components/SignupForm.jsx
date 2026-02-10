    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import postSignup from "../api/post-signup.js";
    import postLogin from "../api/post-login.js";

    function SignupForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [status, setStatus] = useState({ state: "idle", message: "" });

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ state: "idle", message: "" });

        const username = form.username.trim();
        const email = form.email.trim();
        const password = form.password;

        if (!username) {
        setStatus({ state: "error", message: "Username is required." });
        return;
        }

        if (!email) {
        setStatus({ state: "error", message: "Email is required." });
        return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
        setStatus({ state: "error", message: "Please enter a valid email." });
        return;
        }

        if (!password || password.length < 8) {
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
        setStatus({ state: "error", message: err?.message || "Signup failed." });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="authForm" noValidate>
        <h1 className="authTitle">Sign up</h1>

        <label className="field">
            <span className="field__label">Username</span>
            <input
            className="field__control"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose a username"
            disabled={status.state === "submitting"}
            required
            />
        </label>

        <label className="field">
            <span className="field__label">Email</span>
            <input
            className="field__control"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={status.state === "submitting"}
            required
            />
        </label>

        <label className="field">
            <span className="field__label">Password</span>
            <input
            className="field__control"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            disabled={status.state === "submitting"}
            required
            />
        </label>

        <button className="button button--primary" type="submit" disabled={status.state === "submitting"}>
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
        </form>
    );
    }

    export default SignupForm;
