    async function deleteFundraiser(fundraiserId, token) {
    const url = `${import.meta.env.VITE_API_URL}/fundraisers/${fundraiserId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        const fallbackError = `Error deleting fundraiser ${fundraiserId}`;
        const data = await response.json().catch(() => null);
        const msg = data?.detail || fallbackError;
        throw new Error(msg);
    }

    return true;
    }

    export default deleteFundraiser;
