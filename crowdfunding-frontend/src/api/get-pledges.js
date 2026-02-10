    async function getPledges(token) {
    const base = import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    const url = `${base}/pledges/`;

    const headers = {};
    if (token) headers.Authorization = `Token ${token}`;

    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
        const fallbackError = "Error fetching pledges";
        const data = await response.json().catch(() => {
        throw new Error(fallbackError);
        });
        throw new Error(data?.detail ?? fallbackError);
    }

    return await response.json();
    }

    export default getPledges;