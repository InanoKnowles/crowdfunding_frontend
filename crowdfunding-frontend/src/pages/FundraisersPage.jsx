import { useMemo, useState } from "react";
import FundraiserCard from "../components/FundraiserCard.jsx";
import useFundraisers from "../hooks/use-fundraisers.js";
import usePledges from "../hooks/use-pledges.js";
import "./FundraisersPage.css";

function FundraisersPage() {
    const { fundraisers, isLoading, error, refetch } = useFundraisers();
    const { pledges, isLoading: pledgesLoading, error: pledgesError } = usePledges();

    const [query, setQuery] = useState("");

    const [createForm, setCreateForm] = useState({
        title: "",
        description: "",
        goal: "",
        image: "",
        deadline: "",
    });

    const [createStatus, setCreateStatus] = useState({ state: "idle", message: "" });

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const isLoggedIn = Boolean(token);

    function handleQueryChange(e) {
        setQuery(e.target.value);
    }

    function handleCreateChange(e) {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleCreate(e) {
        e.preventDefault();

        if (!isLoggedIn) {
            setCreateStatus({ state: "error", message: "Please log in to create a fundraiser." });
            return;
        }

        const goalNum = Number(createForm.goal);

        if (!createForm.title.trim()) {
            setCreateStatus({ state: "error", message: "Title is required." });
            return;
        }

        if (!createForm.description.trim()) {
            setCreateStatus({ state: "error", message: "Description is required." });
            return;
        }

        if (!goalNum || goalNum <= 0) {
            setCreateStatus({ state: "error", message: "Goal must be a number greater than 0." });
            return;
        }

        if (!createForm.image.trim()) {
            setCreateStatus({ state: "error", message: "Image URL is required." });
            return;
        }

        const payload = {
            title: createForm.title.trim(),
            description: createForm.description.trim(),
            goal: goalNum,
            image: createForm.image.trim(),
            is_open: true,
            deadline: createForm.deadline
                ? new Date(`${createForm.deadline}T23:59:59`).toISOString()
                : null,
        };

        setCreateStatus({ state: "submitting", message: "" });

        try {
            const res = await fetch(`${API_URL}/fundraisers/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = data?.detail || JSON.stringify(data) || "Failed to create fundraiser.";
                throw new Error(msg);
            }

            setCreateForm({
                title: "",
                description: "",
                goal: "",
                image: "",
                deadline: "",
            });

            setCreateStatus({ state: "success", message: "Fundraiser created." });
            await refetch();
        } catch (err) {
            setCreateStatus({ state: "error", message: err.message || "Something went wrong." });
        }
    }

    const normalisedPledges = useMemo(() => {
        if (!isLoggedIn) return [];
        if (Array.isArray(pledges)) return pledges;
        if (pledges && Array.isArray(pledges.results)) return pledges.results;
        return [];
    }, [pledges, isLoggedIn]);

    const pledgeFundraiserIdSet = useMemo(() => {
        const set = new Set();
        for (const p of normalisedPledges) {
            const fid = typeof p.fundraiser === "object" ? p.fundraiser?.id : p.fundraiser;
            if (fid != null) set.add(Number(fid));
        }
        return set;
    }, [normalisedPledges]);

    const pledgedTotalsByFundraiserId = useMemo(() => {
        const totals = new Map();
        for (const p of normalisedPledges) {
            const fid = typeof p.fundraiser === "object" ? p.fundraiser?.id : p.fundraiser;
            const fundraiserId = fid != null ? Number(fid) : null;
            if (fundraiserId == null) continue;
            const prev = totals.get(fundraiserId) || 0;
            totals.set(fundraiserId, prev + Number(p.amount || 0));
        }
        return totals;
    }, [normalisedPledges]);

    const visibleFundraisers = useMemo(() => {
        const list = Array.isArray(fundraisers) ? fundraisers : [];

        const q = query.trim().toLowerCase();
        const filtered = !q
            ? list
            : list.filter((f) => {
                  const title = (f.title || "").toLowerCase();
                  const desc = (f.description || "").toLowerCase();
                  const owner = (f.owner_username || "").toLowerCase();
                  return title.includes(q) || desc.includes(q) || owner.includes(q);
              });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const createdToday = [];
        const active = [];
        const bottom = [];

        for (const f of filtered) {
            const createdAt = f.date_created ? new Date(f.date_created) : null;
            const deadline = f.deadline ? new Date(f.deadline) : null;

            const isOpen =
                typeof f.computed_is_open === "boolean" ? f.computed_is_open : Boolean(f.is_open);

            const isCreatedToday = createdAt && createdAt >= startOfToday && createdAt < startOfTomorrow;

            const deadlineInFuture = deadline && deadline >= startOfTomorrow;
            const deadlineBeforeToday = deadline && deadline < startOfToday;

            if (isCreatedToday) {
                createdToday.push(f);
                continue;
            }

            if (isOpen && deadlineInFuture) {
                active.push(f);
                continue;
            }

            if (!isOpen || deadlineBeforeToday || !deadline) {
                bottom.push(f);
                continue;
            }

            bottom.push(f);
        }

        createdToday.sort(
            (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

        active.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());

        bottom.sort((a, b) => {
            const ad = a.deadline ? new Date(a.deadline).getTime() : Number.NEGATIVE_INFINITY;
            const bd = b.deadline ? new Date(b.deadline).getTime() : Number.NEGATIVE_INFINITY;

            if (ad !== bd) return bd - ad;
            return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        });

        return [...createdToday, ...active, ...bottom];
    }, [fundraisers, query]);

    const myPledgedFundraisers = useMemo(() => {
        if (!isLoggedIn) return [];
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        return list.filter((f) => pledgeFundraiserIdSet.has(Number(f.id)));
    }, [fundraisers, pledgeFundraiserIdSet, isLoggedIn]);

    const myCreatedFundraisers = useMemo(() => {
        if (!isLoggedIn) return [];
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        const username = localStorage.getItem("username") || "";
        if (!username) return [];
        return list.filter((f) => (f.owner_username || "") === username);
    }, [fundraisers, isLoggedIn]);

    return (
        <main className="container section">
            <section className="fundraisersHero">
                <div className="fundraisersHero__left" aria-hidden="true" />
                <div className="fundraisersHero__right">
                    <h2 className="fundraisersHero__title">Create fundraiser</h2>

                    {!isLoggedIn ? (
                        <p className="muted">Log in to create a fundraiser.</p>
                    ) : (
                        <form className="createFundraiserForm" onSubmit={handleCreate} noValidate>
                            <label className="field">
                                <span className="field__label">Title</span>
                                <input
                                    className="field__control"
                                    name="title"
                                    value={createForm.title}
                                    onChange={handleCreateChange}
                                    placeholder="Warm beds winter drive"
                                    required
                                    disabled={createStatus.state === "submitting"}
                                />
                            </label>

                            <label className="field">
                                <span className="field__label">Description</span>
                                <textarea
                                    className="field__control"
                                    name="description"
                                    rows={4}
                                    value={createForm.description}
                                    onChange={handleCreateChange}
                                    placeholder="Tell people what you are raising money for…"
                                    required
                                    disabled={createStatus.state === "submitting"}
                                />
                            </label>

                            <div className="createFundraiserForm__row">
                                <label className="field">
                                    <span className="field__label">Goal (AUD)</span>
                                    <input
                                        className="field__control"
                                        name="goal"
                                        type="number"
                                        min="1"
                                        value={createForm.goal}
                                        onChange={handleCreateChange}
                                        placeholder="5000"
                                        required
                                        disabled={createStatus.state === "submitting"}
                                    />
                                </label>

                                <label className="field">
                                    <span className="field__label">Deadline</span>
                                    <input
                                        className="field__control"
                                        name="deadline"
                                        type="date"
                                        value={createForm.deadline}
                                        onChange={handleCreateChange}
                                        disabled={createStatus.state === "submitting"}
                                    />
                                </label>
                            </div>

                            <label className="field">
                                <span className="field__label">Image URL</span>
                                <input
                                    className="field__control"
                                    name="image"
                                    value={createForm.image}
                                    onChange={handleCreateChange}
                                    placeholder="https://…"
                                    required
                                    disabled={createStatus.state === "submitting"}
                                />
                            </label>

                            <button
                                className="button button--primary"
                                type="submit"
                                disabled={createStatus.state === "submitting"}
                            >
                                {createStatus.state === "submitting" ? "Creating…" : "Create fundraiser"}
                            </button>

                            {createStatus.state !== "idle" && (
                                <p
                                    className={
                                        createStatus.state === "success"
                                            ? "formStatus formStatus--success"
                                            : "formStatus formStatus--error"
                                    }
                                    role="status"
                                >
                                    {createStatus.message}
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </section>

            {isLoggedIn && (
                <section className="fundraisersListHeader">
                    <h2 className="fundraisersListHeader__title">My pledges</h2>

                    {pledgesLoading ? null : pledgesError ? null : myPledgedFundraisers.length ? (
                        <div id="my-pledges-list">
                            {myPledgedFundraisers.map((f) => (
                                <FundraiserCard
                                    key={`pledged-${f.id}`}
                                    fundraiserData={f}
                                    pledgedAmount={pledgedTotalsByFundraiserId.get(Number(f.id)) || 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="muted">You have not made any pledges yet.</p>
                    )}
                </section>
            )}

            {isLoggedIn && (
                <section className="fundraisersListHeader">
                    <h2 className="fundraisersListHeader__title">My created fundraisers</h2>

                    {myCreatedFundraisers.length ? (
                        <div id="my-created-list">
                            {myCreatedFundraisers.map((f) => (
                                <FundraiserCard key={`mine-${f.id}`} fundraiserData={f} />
                            ))}
                        </div>
                    ) : (
                        <p className="muted">You have not created any fundraisers yet.</p>
                    )}
                </section>
            )}

            <section className="fundraisersListHeader">
                <h2 className="fundraisersListHeader__title">All fundraisers</h2>

                <div className="searchBar">
                    <input
                        className="searchBar__input"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Search for fundraisers…"
                        aria-label="Search fundraisers"
                    />
                </div>
            </section>

            {isLoading ? null : error ? null : (
                <div id="fundraiser-list">
                    {visibleFundraisers.map((f) => (
                        <FundraiserCard key={f.id} fundraiserData={f} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default FundraisersPage;