import { useState, useEffect, useCallback } from "react";
import getFundraiser from "../api/get-fundraiser";

export default function useFundraiser(fundraiserId) {
    const [fundraiser, setFundraiser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await getFundraiser(fundraiserId);
            setFundraiser(data);
        } catch (err) {
            setError(err?.message || "Could not load fundraiser.");
        } finally {
            setIsLoading(false);
        }
    }, [fundraiserId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { fundraiser, isLoading, error, refetch };
}