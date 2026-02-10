    async function patchFundraiser(fundraiserId, token, payload) {
    const url = `${import.meta.env.VITE_API_URL}/fundraisers/${fundraiserId}/`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const fallbackError = `Error updating fundraiser ${fundraiserId}`;
        const data = await response.json().catch(() => null);
        const msg = data?.detail || JSON.stringify(data) || fallbackError;
        throw new Error(msg);
    }

    return await response.json();
    }

    export default patchFundraiser;
