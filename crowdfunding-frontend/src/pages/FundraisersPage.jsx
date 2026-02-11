    import { useMemo, useState } from "react";
    import FundraiserCard from "../components/FundraiserCard.jsx";
    import useFundraisers from "../hooks/use-fundraisers.js";
    import usePledges from "../hooks/use-pledges.js";
    import { useAuth } from "../components/AuthProvider.jsx";
    import "./FundraisersPage.css";

    function FundraisersPage() {
    const { auth } = useAuth();
    const token = auth?.token || localStorage.getItem("token");
    const isLoggedIn = Boolean(token);

    const username =
        auth?.username ||
        localStorage.getItem("username") ||
        localStorage.getItem("user") ||
        "";

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
        deadline: createForm.deadline ? new Date(`${createForm.deadline}T23:59:59`).toISOString() : null,
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
        setCreateStatus({ state: "error", message: err?.message || "Something went wrong." });
        }
    }

    const normalisedPledges = useMemo(() => {
        if (!isLoggedIn) return [];
        if (Array.isArray(pledges)) return pledges;
        if (pledges && Array.isArray(pledges.results)) return pledges.results;
        return [];
    }, [pledges, isLoggedIn]);

    const myPledges = useMemo(() => {
        if (!isLoggedIn) return [];
        if (!username) return [];
        const u = username.toLowerCase();

        return normalisedPledges.filter((p) => {
        const supporterUsername = (p.supporter_username || "").toLowerCase();
        return supporterUsername === u;
        });
    }, [normalisedPledges, isLoggedIn, username]);

    const pledgedTotalsByFundraiserId = useMemo(() => {
        const totals = new Map();
        for (const p of myPledges) {
        const fid = typeof p.fundraiser === "object" ? p.fundraiser?.id : p.fundraiser;
        const fundraiserId = fid != null ? Number(fid) : null;
        if (fundraiserId == null) continue;
        const prev = totals.get(fundraiserId) || 0;
        totals.set(fundraiserId, prev + Number(p.amount || 0));
        }
        return totals;
    }, [myPledges]);

    const pledgeFundraiserIdSet = useMemo(() => {
        return new Set(Array.from(pledgedTotalsByFundraiserId.keys()));
    }, [pledgedTotalsByFundraiserId]);

    const myPledgedFundraisers = useMemo(() => {
        if (!isLoggedIn) return [];
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        return list.filter((f) => pledgeFundraiserIdSet.has(Number(f.id)));
    }, [fundraisers, pledgeFundraiserIdSet, isLoggedIn]);

    const myCreatedFundraisers = useMemo(() => {
        if (!isLoggedIn) return [];
        if (!username) return [];
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        return list.filter((f) => (f.owner_username || "") === username);
    }, [fundraisers, isLoggedIn, username]);

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

        const isOpen = typeof f.computed_is_open === "boolean" ? f.computed_is_open : Boolean(f.is_open);

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

        createdToday.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        active.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());

        bottom.sort((a, b) => {
        const ad = a.deadline ? new Date(a.deadline).getTime() : Number.NEGATIVE_INFINITY;
        const bd = b.deadline ? new Date(b.deadline).getTime() : Number.NEGATIVE_INFINITY;
        if (ad !== bd) return bd - ad;
        return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        });

        return [...createdToday, ...active, ...bottom];
    }, [fundraisers, query]);

    return (
        //----------------------------
        <main className="container section fundraisersPage">
            <section className="fundraisersBlock">
                <div className="createFundraiserCard">
                    <header className="createFundraiserHeader">
                    <h2 className="createFundraiserTitle">
                        {(localStorage.getItem("username") || "Visitor")} Create a Fundraiser
                    </h2>
                    <p className="createFundraiserSub">
                        Please note that pledges are non-refundable and uneditable.
                    </p>
                    </header>

                    {!isLoggedIn ? (
                    <p className="fundraisersBlock__sub">Log in to create a fundraiser.</p>
                    ) : (
                    <form className="createFundraiserForm" onSubmit={handleCreate} noValidate>
                        <label className="createFundraiserField">
                        <span className="createFundraiserLabel">Title</span>
                        <input
                            className="createFundraiserInput"
                            name="title"
                            value={createForm.title}
                            onChange={handleCreateChange}
                            placeholder="Warm beds winter drive"
                            required
                            disabled={createStatus.state === "submitting"}
                        />
                        </label>

                        <label className="createFundraiserField">
                        <span className="createFundraiserLabel">Description</span>
                        <textarea
                            className="createFundraiserInput createFundraiserTextarea"
                            name="description"
                            rows={5}
                            value={createForm.description}
                            onChange={handleCreateChange}
                            placeholder="Tell people what you are raising money for…"
                            required
                            disabled={createStatus.state === "submitting"}
                        />
                        </label>

                        <div className="createFundraiserGrid">
                        <label className="createFundraiserField">
                            <span className="createFundraiserLabel">Goal (AUD)</span>
                            <input
                            className="createFundraiserInput"
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

                        <label className="createFundraiserField">
                            <span className="createFundraiserLabel">Deadline</span>
                            <input
                            className="createFundraiserInput"
                            name="deadline"
                            type="date"
                            value={createForm.deadline}
                            onChange={handleCreateChange}
                            disabled={createStatus.state === "submitting"}
                            />
                        </label>
                        </div>

                        <label className="createFundraiserField">
                        <span className="createFundraiserLabel">Image URL</span>
                        <input
                            className="createFundraiserInput"
                            name="image"
                            value={createForm.image}
                            onChange={handleCreateChange}
                            placeholder="https://…"
                            required
                            disabled={createStatus.state === "submitting"}
                        />
                        </label>

                        <button
                        className="button button--primary createFundraiserButton"
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
            <section className="fundraisersBlock">
            <div className="pledgesCard">
                <h2 className="fundraisersBlock__title">My pledges</h2>

                {pledgesLoading ? (
                <p className="fundraisersBlock__sub">Loading your pledges…</p>
                ) : pledgesError ? (
                <p className="fundraisersBlock__sub">Could not load your pledges.</p>
                ) : myPledgedFundraisers.length ? (
                <div className="fundraiserGrid">
                    {myPledgedFundraisers.map((f) => (
                    <FundraiserCard
                        key={`pledged-${f.id}`}
                        fundraiserData={f}
                        pledgedAmount={pledgedTotalsByFundraiserId.get(Number(f.id)) || 0}
                    />
                    ))}
                </div>
                ) : (
                <p className="fundraisersBlock__sub">You have not made any pledges yet.</p>
                )}
            </div>
            </section>
        )}

        {isLoggedIn && (
            <section className="fundraisersBlock">
            <div className="createdCard">
                <h2 className="fundraisersBlock__title">My created fundraisers</h2>

                {myCreatedFundraisers.length ? (
                <div className="fundraiserGrid">
                    {myCreatedFundraisers.map((f) => (
                    <FundraiserCard key={`mine-${f.id}`} fundraiserData={f} />
                    ))}
                </div>
                ) : (
                <p className="fundraisersBlock__sub">You have not created any fundraisers yet.</p>
                )}
            </div>
            </section>
        )}

        <section className="fundraisersBlock">
            <div className="allFundraisersCard">
            <div className="fundraisersHeaderRow">
                <h2 className="fundraisersBlock__title">All fundraisers</h2>

                <div className="searchBar">
                <input
                    className="searchBar__input"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Search for fundraisers…"
                    aria-label="Search fundraisers"
                />
                </div>
            </div>

            {isLoading ? (
                <p className="fundraisersBlock__sub">Loading…</p>
            ) : error ? (
                <p className="fundraisersBlock__sub">Could not load fundraisers.</p>
            ) : (
                <div className="fundraiserGrid">
                {visibleFundraisers.map((f) => (
                    <FundraiserCard key={f.id} fundraiserData={f} />
                ))}
                </div>
            )}
            </div>
        </section>
        </main>
    );
    }

    export default FundraisersPage;
