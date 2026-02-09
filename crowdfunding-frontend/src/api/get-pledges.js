    async function getPledges(token) {
    const url = `${import.meta.env.VITE_API_URL}/pledges/`;
    const response = await fetch(url, {
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || "Error fetching pledges");
    }

    return await response.json();
    }

    export default getPledges;
