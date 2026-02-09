    import { useEffect, useState, useCallback } from "react";
    import getFundraisers from "../api/get-fundraisers.js";

    export default function useFundraisers() {
    const [fundraisers, setFundraisers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
        const data = await getFundraisers();
        setFundraisers(data);
        } catch (err) {
        setError(
            err instanceof Error
            ? err
            : new Error("Could not load fundraisers.")
        );
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { fundraisers, isLoading, error, refetch };
    }
