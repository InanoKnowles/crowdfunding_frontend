    async function postSignup(username, email, password) {
    const url = `${import.meta.env.VITE_API_URL}/users/`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        username,
        email,
        password,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.detail || JSON.stringify(data) || "Error trying to sign up");
    }

    return data;
    }

    export default postSignup;
