import { useState, useEffect } from "react";
import getFundraiser from "../api/get-fundraiser";

export default function useFundraiser(fundraiserId) {
    const [fundraiser, setFundraiser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setIsLoading(true);
        setError("");

        getFundraiser(fundraiserId)
            .then((fundraiserData) => {
                setFundraiser(fundraiserData);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err?.message || "Could not load fundraiser.");
                setIsLoading(false);
            });
    }, [fundraiserId]);

    return { fundraiser, isLoading, error };
}
