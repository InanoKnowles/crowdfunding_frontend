    import { useEffect, useState, useCallback } from "react";
    import getFundraisers from "../api/get-fundraisers";

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
        } catch (e) {
        setError(e);
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { fundraisers, isLoading, error, refetch };
    }
