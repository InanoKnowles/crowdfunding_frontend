    import { useEffect, useState } from "react";

    export default function usePledges() {
    const [pledges, setPledges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        setIsLoading(false);
        return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/pledges/`, {
        headers: {
            Authorization: `Token ${token}`,
        },
        })
        .then((res) => res.json())
        .then(setPledges)
        .finally(() => setIsLoading(false));
    }, []);

    return { pledges, isLoading };
    }
