    async function getFundraiser(fundraiserId) {
    const url = `${import.meta.env.VITE_API_URL}/fundraisers/${fundraiserId}`;
    const response = await fetch(url);

    if (!response.ok) {
        let errorMessage = `Error fetching fundraiser with id ${fundraiserId}`;

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

    export default getFundraiser;
