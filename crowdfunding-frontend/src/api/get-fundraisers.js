    async function getFundraisers() {
    const url = `${import.meta.env.VITE_API_URL}/fundraisers`;
    const response = await fetch(url);

    if (!response.ok) {
        let errorMessage = "Error fetching fundraisers";

        try {
        const data = await response.json();
        if (data?.detail) {
            errorMessage = data.detail;
        }
        } catch {

        }

        throw new Error(errorMessage);
    }

    return response.json();
    }

    export default getFundraisers;
