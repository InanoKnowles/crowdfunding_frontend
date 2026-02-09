import { useMemo, useState } from "react";
import useFundraisers from "../hooks/use-fundraisers";
import FundraiserCard from "../components/FundraiserCard";
import "./FundraisersPage.css";

const API_URL = import.meta.env.VITE_API_URL;

function FundraisersPage() {
    const { fundraisers, isLoading, error, refetch } = useFundraisers();

    const [query, setQuery] = useState("");
    const [form, setForm] = useState({
    title: "",
    description: "",
    goal: "",
    deadline: "",
    image: "",
    });

    const token = localStorage.getItem("token");
    const isLoggedIn = Boolean(token);

    const filteredAndSorted = useMemo(() => {
    const list = Array.isArray(fundraisers) ? fundraisers : [];

    const filtered = list.filter((f) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
        (f.title || "").toLowerCase().includes(q) ||
        (f.description || "").toLowerCase().includes(q)
        );
    });

    filtered.sort((a, b) => {
        const ad = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const bd = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return ad - bd;
    });

    return filtered;
    }, [fundraisers, query]);

    function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleCreate(e) {
    e.preventDefault();

    if (!isLoggedIn) return;

    if (!form.title.trim() || !form.goal || !form.deadline) return;

    try {
        const response = await fetch(`${API_URL}/fundraisers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            title: form.title,
            description: form.description,
            goal: Number(form.goal),
            deadline: form.deadline,
            image: form.image,
        }),
        });

        if (!response.ok) {
        throw new Error("Failed to create fundraiser");
        }

        setForm({ title: "", description: "", goal: "", deadline: "", image: "" });
        refetch?.();
    } catch (err) {
        console.error(err);
    }
    }

    if (isLoading) return <main className="container section">Loading…</main>;
    if (error) return <main className="container section">{error.message}</main>;

    return (
    <main className="fundraisers-page">
      {/* I really need to find a cool hero image or make a banner */}
        <section className="fundraisers-hero">
        <div className="container fundraisers-hero__inner">
            <div className="fundraisers-hero__copy">
            <h1>Fundraisers</h1>
            <p>
                Explore active and past fundraisers. The ones with deadlines coming up soon are shown first.
            </p>
            </div>

            <div className="fundraisers-hero__panel">
            {isLoggedIn ? (
                <>
                <h2>Create your fundraiser</h2>

                <form className="create-form" onSubmit={handleCreate}>
                    <label>
                    Title
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                    </label>

                    <label>
                    Description
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                    />
                    </label>

                    <div className="create-form__row">
                    <label>
                        Goal ($)
                        <input
                        name="goal"
                        type="number"
                        min="1"
                        value={form.goal}
                        onChange={handleChange}
                        required
                        />
                    </label>

                    <label>
                        Deadline
                        <input
                        name="deadline"
                        type="date"
                        value={form.deadline}
                        onChange={handleChange}
                        required
                        />
                    </label>
                    </div>

                    <label>
                    Image URL
                    <input
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://…"
                    />
                    </label>

                    <button className="button" type="submit">Create</button>
                </form>
                </>
            ) : (
                <>
                <h2>Create your fundraiser</h2>
                <p>You must be logged in to create a fundraiser.</p>
                </>
            )}
            </div>
        </div>
        </section>

      {/* SEARCH + LIST I need to figure out how to get my search bar form backend here */}
        <section className="container section">
        <div className="fundraisers-toolbar">
            <input
            className="fundraisers-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fundraisers…"
            aria-label="Search fundraisers"
            />
        </div>

        <div id="fundraiser-list">
            {filteredAndSorted.map((f) => (
            <FundraiserCard key={f.id} fundraiserData={f} />
            ))}
        </div>
        </section>
    </main>
    );
}

export default FundraisersPage;
