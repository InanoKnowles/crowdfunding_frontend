    import { useCallback, useEffect, useState } from "react";
    import getPledges from "../api/get-pledges.js";
    import { useAuth } from "../components/AuthProvider.jsx";

    export default function usePledges() {
    const { auth } = useAuth();
    const token = auth?.token || localStorage.getItem("token") || "";

    const [pledges, setPledges] = useState([]);
    const [isLoading, setIsLoading] = useState(Boolean(token));
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!token) {
        setPledges([]);
        setIsLoading(false);
        setError(null);
        return;
        }

        setIsLoading(true);
        setError(null);

        try {
        const data = await getPledges(token);
        setPledges(data);
        } catch (e) {
        setError(e);
        setPledges([]);
        } finally {
        setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { pledges, isLoading, error, refetch };
    }