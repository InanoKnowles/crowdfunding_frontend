    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import postSignup from "../api/post-signup.js";
    import postLogin from "../api/post-login.js";

    function SignupForm() {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");

    function handleChange(e) {
        const { id, value } = e.target;
        setCredentials((prev) => ({ ...prev, [id]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
        await postSignup(credentials.username, credentials.password);
        const loginResponse = await postLogin(
            credentials.username,
            credentials.password
        );
        localStorage.setItem("token", loginResponse.token);
        navigate("/");
        } catch (err) {
        setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="username">Username:</label>
            <input
            id="username"
            type="text"
            value={credentials.username}
            onChange={handleChange}
            required
            />
        </div>

        <div>
            <label htmlFor="password">Password:</label>
            <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
            />
        </div>

        <button type="submit">Sign up</button>

        {error && <p>{error}</p>}
        </form>
    );
    }

    export default SignupForm;
