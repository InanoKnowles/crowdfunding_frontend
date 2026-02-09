    async function postSignup(username, password) {
    const url = `${import.meta.env.VITE_API_URL}/users/`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        username,
        password,
        }),
    });

    if (!response.ok) {
        const fallbackError = "Error creating account";
        const data = await response.json().catch(() => {
        throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? JSON.stringify(data) ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
    }

    export default postSignup;
