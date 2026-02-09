import { useState, useEffect } from "react";
import getFundraisers from "../api/get-fundraisers";

export default function useFundraisers() {
    const [fundraisers, setFundraisers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setIsLoading(true);
        setError("");

        getFundraisers()
            .then((fundraisersData) => {
                setFundraisers(fundraisersData);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err?.message || "Could not load fundraisers.");
                setIsLoading(false);
            });
    }, []);

    return { fundraisers, isLoading, error };
}
