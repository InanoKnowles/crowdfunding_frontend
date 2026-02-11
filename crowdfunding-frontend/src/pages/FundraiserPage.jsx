    import { useMemo, useState, useEffect } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import useFundraiser from "../hooks/use-fundraiser.js";
    import patchFundraiser from "../api/patch-fundraiser.js";
    import deleteFundraiser from "../api/delete-fundraiser.js";
    import "./FundraiserPage.css";

    function FundraiserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fundraiser, isLoading, error, refetch } = useFundraiser(id);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const isLoggedIn = Boolean(token);
    const loggedInUsername = localStorage.getItem("username") || "";

    const isOwner = useMemo(() => {
        if (!fundraiser) return false;
        if (!isLoggedIn) return false;
        if (!loggedInUsername) return false;
        return (fundraiser.owner_username || "") === loggedInUsername;
    }, [fundraiser, isLoggedIn, loggedInUsername]);

    const totalPledged = useMemo(() => {
        if (!fundraiser?.pledges) return 0;
        return fundraiser.pledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    }, [fundraiser]);

    const goalAmount = Number(fundraiser?.goal ?? 0);
    const isClosedByGoal = goalAmount > 0 && totalPledged >= goalAmount;

    const isOpen =
        typeof fundraiser?.computed_is_open === "boolean"
        ? fundraiser.computed_is_open
        : typeof fundraiser?.is_open === "boolean"
        ? fundraiser.is_open && !isClosedByGoal
        : !isClosedByGoal;

    const statusText = isOpen ? "Open" : "Closed";

    const progressPct =
        goalAmount > 0 ? Math.min(100, Math.round((totalPledged / goalAmount) * 100)) : 0;

    const [pledgeForm, setPledgeForm] = useState({
        amount: "",
        comment: "",
        anonymous: false,
    });

    const [pledgeStatus, setPledgeStatus] = useState({
        state: "idle",
        message: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        goal: "",
        image: "",
        deadline: "",
        is_open: true,
    });

    const [editStatus, setEditStatus] = useState({ state: "idle", message: "" });
    const [deleteStatus, setDeleteStatus] = useState({ state: "idle", message: "" });

    useEffect(() => {
        if (!fundraiser) return;

        const deadlineDate = fundraiser.deadline ? new Date(fundraiser.deadline) : null;
        const yyyy = deadlineDate ? deadlineDate.getFullYear() : "";
        const mm = deadlineDate ? String(deadlineDate.getMonth() + 1).padStart(2, "0") : "";
        const dd = deadlineDate ? String(deadlineDate.getDate()).padStart(2, "0") : "";
        const deadlineInput = deadlineDate ? `${yyyy}-${mm}-${dd}` : "";

        setEditForm({
        title: fundraiser.title || "",
        description: fundraiser.description || "",
        goal: String(fundraiser.goal ?? ""),
        image: fundraiser.image || "",
        deadline: deadlineInput,
        is_open: typeof fundraiser.is_open === "boolean" ? fundraiser.is_open : true,
        });
    }, [fundraiser]);

    function handlePledgeChange(e) {
        const { name, value, type, checked } = e.target;
        setPledgeForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleMakePledge(e) {
        e.preventDefault();
        if (!fundraiser) return;

        if (!isLoggedIn) {
        setPledgeStatus({ state: "error", message: "Please log in to make a pledge." });
        return;
        }

        if (!isOpen) {
        setPledgeStatus({
            state: "error",
            message: "This fundraiser is closed and cannot accept pledges.",
        });
        return;
        }

        const amountNum = Number(pledgeForm.amount);
        if (!amountNum || amountNum <= 0) {
        setPledgeStatus({ state: "error", message: "Please enter a valid amount." });
        return;
        }

        setPledgeStatus({ state: "submitting", message: "" });

        try {
        const response = await fetch(`${API_URL}/pledges/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
            amount: amountNum,
            comment: pledgeForm.comment,
            anonymous: pledgeForm.anonymous,
            fundraiser: fundraiser.id,
            }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const msg = data?.detail || JSON.stringify(data) || "Failed to make pledge.";
            throw new Error(msg);
        }

        setPledgeStatus({
            state: "success",
            message: "Thanks for your pledge. Your support matters.",
        });

        setPledgeForm({ amount: "", comment: "", anonymous: false });
        await refetch();
        } catch (err) {
        setPledgeStatus({
            state: "error",
            message: err?.message || "Something went wrong.",
        });
        }
    }

    function handleEditChange(e) {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        if (!fundraiser) return;

        if (!isLoggedIn) {
        setEditStatus({ state: "error", message: "Please log in." });
        return;
        }

        if (!isOwner) {
        setEditStatus({ state: "error", message: "You can only edit your own fundraiser." });
        return;
        }

        const goalNum = Number(editForm.goal);
        if (!editForm.title.trim()) {
        setEditStatus({ state: "error", message: "Title is required." });
        return;
        }
        if (!editForm.description.trim()) {
        setEditStatus({ state: "error", message: "Description is required." });
        return;
        }
        if (!goalNum || goalNum <= 0) {
        setEditStatus({ state: "error", message: "Goal must be greater than 0." });
        return;
        }
        if (!editForm.image.trim()) {
        setEditStatus({ state: "error", message: "Image URL is required." });
        return;
        }

        const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        goal: goalNum,
        image: editForm.image.trim(),
        is_open: Boolean(editForm.is_open),
        deadline: editForm.deadline ? new Date(`${editForm.deadline}T23:59:59`).toISOString() : null,
        };

        setEditStatus({ state: "submitting", message: "" });

        try {
        await patchFundraiser(fundraiser.id, token, payload);
        setEditStatus({ state: "success", message: "Fundraiser updated." });
        setIsEditing(false);
        await refetch();
        } catch (err) {
        setEditStatus({ state: "error", message: err?.message || "Update failed." });
        }
    }

    async function handleDelete() {
        if (!fundraiser) return;

        if (!isLoggedIn) {
        setDeleteStatus({ state: "error", message: "Please log in." });
        return;
        }

        if (!isOwner) {
        setDeleteStatus({ state: "error", message: "You can only delete your own fundraiser." });
        return;
        }

        const ok = window.confirm("Delete this fundraiser? This cannot be undone.");
        if (!ok) return;

        setDeleteStatus({ state: "submitting", message: "" });

        try {
        await deleteFundraiser(fundraiser.id, token);
        setDeleteStatus({ state: "success", message: "Fundraiser deleted." });
        navigate("/fundraisers");
        } catch (err) {
        setDeleteStatus({ state: "error", message: err?.message || "Delete failed." });
        }
    }

    if (isLoading) return <main className="container section">Loading…</main>;

    if (error) {
        return <main className="container section">{error.message}</main>;
    }

    if (!fundraiser) {
        return <main className="container section">Fundraiser not found.</main>;
    }

    return (
        <main className="container section fundraiser">
        <header className="fundraiser__header">
            <div className="fundraiser__titleRow">
            <h1 className="fundraiser__title">{fundraiser.title}</h1>
            <span className={`statusPill ${isOpen ? "statusPill--open" : "statusPill--closed"}`}>
                {statusText}
            </span>
            </div>

            <p className="fundraiser__meta">
            Created {new Date(fundraiser.date_created).toLocaleString("en-AU")}
            </p>

            {isOwner && (
            <div className="ownerActions">
                <button
                type="button"
                className="button"
                onClick={() => {
                    setEditStatus({ state: "idle", message: "" });
                    setDeleteStatus({ state: "idle", message: "" });
                    setIsEditing((v) => !v);
                }}
                >
                {isEditing ? "Cancel" : "Edit"}
                </button>

                <button
                type="button"
                className="button button--danger"
                onClick={handleDelete}
                disabled={deleteStatus.state === "submitting"}
                >
                {deleteStatus.state === "submitting" ? "Deleting…" : "Delete"}
                </button>

                {(editStatus.state !== "idle" || deleteStatus.state !== "idle") && (
                <p
                    className={
                    editStatus.state === "error" || deleteStatus.state === "error"
                        ? "formStatus formStatus--error"
                        : "formStatus formStatus--success"
                    }
                >
                    {editStatus.message || deleteStatus.message}
                </p>
                )}
            </div>
            )}
        </header>

        {/* Owner edit form styled like LoginForm, but renamed properly */}
        {isOwner && isEditing && (
            <section className="editFundraiserCard">
                <header className="editFundraiserHeader">
                <h2 className="editFundraiserTitle">Edit fundraiser</h2>
                <p className="editFundraiserSub">Update details and save your changes.</p>
                </header>

                <form className="editFundraiserForm" onSubmit={handleSaveEdit} noValidate>
                <label className="editFundraiserField">
                    <span className="editFundraiserLabel">Title</span>
                    <input
                    className="editFundraiserInput"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    />
                </label>

                <label className="editFundraiserField">
                    <span className="editFundraiserLabel">Description</span>
                    <textarea
                    className="editFundraiserInput editFundraiserTextarea"
                    name="description"
                    rows={5}
                    value={editForm.description}
                    onChange={handleEditChange}
                    required
                    />
                </label>

                <div className="editFundraiserGrid">
                    <label className="editFundraiserField">
                    <span className="editFundraiserLabel">Goal (AUD)</span>
                    <input
                        className="editFundraiserInput"
                        name="goal"
                        type="number"
                        min="1"
                        value={editForm.goal}
                        onChange={handleEditChange}
                        required
                    />
                    </label>

                    <label className="editFundraiserField">
                    <span className="editFundraiserLabel">Deadline</span>
                    <input
                        className="editFundraiserInput"
                        name="deadline"
                        type="date"
                        value={editForm.deadline}
                        onChange={handleEditChange}
                    />
                    </label>
                </div>

                <label className="editFundraiserField">
                    <span className="editFundraiserLabel">Image URL</span>
                    <input
                    className="editFundraiserInput"
                    name="image"
                    value={editForm.image}
                    onChange={handleEditChange}
                    required
                    />
                </label>

                <div className="editFundraiserActions">
                    <label className="editFundraiserCheck">
                    <input
                        name="is_open"
                        type="checkbox"
                        checked={Boolean(editForm.is_open)}
                        onChange={handleEditChange}
                    />
                    <span>Accepting pledges</span>
                    </label>

                    <button
                    className="button button--primary editFundraiserButton"
                    type="submit"
                    disabled={editStatus.state === "submitting"}
                    >
                    {editStatus.state === "submitting" ? "Saving…" : "Save changes"}
                    </button>
                </div>
                </form>
            </section>
            )}

        <div className="fundraiser__grid">
            <section className="card fundraiser__main">
            <div className="fundraiser__media">
                <img className="fundraiser__image" src={fundraiser.image} alt={fundraiser.title} />
            </div>

            <div className="fundraiser__body">
                <div className="stats">
                <div className="stat">
                    <div className="stat__label">Raised</div>
                    <div className="stat__value">${totalPledged.toLocaleString("en-AU")}</div>
                </div>

                <div className="stat">
                    <div className="stat__label">Goal</div>
                    <div className="stat__value">${goalAmount.toLocaleString("en-AU")}</div>
                </div>

                <div className="stat">
                    <div className="stat__label">Progress</div>
                    <div className="stat__value">{progressPct}%</div>
                </div>
                </div>

                <div className="progressBar">
                <span className="progressBar__fill" style={{ width: `${progressPct}%` }} />
                </div>

                {!isOpen && isClosedByGoal && (
                <div className="notice notice--closed">
                    This fundraiser has reached its goal and is now closed.
                </div>
                )}

                <h2 className="fundraiser__sectionTitle">About this fundraiser</h2>

                <p className="fundraiser__description">
                {fundraiser.description || "No description provided yet."}
                </p>
            </div>
            </section>

            <aside className="fundraiser__side">
            <section className="card pledgeCard">
                <h2 className="pledgeCard__title">Make a pledge</h2>

                {!isLoggedIn ? (
                <div className="pledgeCard__noticeBox">Please log in to make a pledge.</div>
                ) : (
                <form className="pledgeForm" onSubmit={handleMakePledge} noValidate>
                    <label className="field">
                    <span className="field__label">Amount (AUD)</span>
                    <input
                        className="field__control"
                        name="amount"
                        type="number"
                        min="1"
                        value={pledgeForm.amount}
                        onChange={handlePledgeChange}
                        disabled={!isOpen || pledgeStatus.state === "submitting"}
                        required
                    />
                    </label>

                    <label className="field">
                    <span className="field__label">Message (optional)</span>
                    <textarea
                        className="field__control"
                        name="comment"
                        rows={3}
                        value={pledgeForm.comment}
                        onChange={handlePledgeChange}
                        disabled={!isOpen || pledgeStatus.state === "submitting"}
                    />
                    </label>

                    <div className="pledgeActions">
                    <label className="pledgeAnon">
                        <input
                        name="anonymous"
                        type="checkbox"
                        checked={pledgeForm.anonymous}
                        onChange={handlePledgeChange}
                        disabled={!isOpen || pledgeStatus.state === "submitting"}
                        />
                        <span>Pledge anonymously</span>
                    </label>

                    <button
                        className="button button--primary pledgeSubmit"
                        type="submit"
                        disabled={!isOpen || pledgeStatus.state === "submitting"}
                    >
                        {pledgeStatus.state === "submitting" ? "Submitting…" : "Pledge now"}
                    </button>
                    </div>

                    {pledgeStatus.state !== "idle" && (
                    <p
                        className={
                        pledgeStatus.state === "success"
                            ? "formStatus formStatus--success"
                            : "formStatus formStatus--error"
                        }
                    >
                        {pledgeStatus.message}
                    </p>
                    )}
                </form>
                )}
            </section>

            <section className="card pledgesCard">
                <h2 className="pledgesCard__title">Pledges</h2>

                {fundraiser.pledges?.length ? (
                <ul className="pledgeList">
                    {fundraiser.pledges.map((p, index) => (
                    <li key={p.id ?? index} className="pledgeItem">
                        <div className="pledgeItem__top">
                        <span className="pledgeItem__amount">
                            ${Number(p.amount).toLocaleString("en-AU")}
                        </span>
                        <span className="pledgeItem__by muted">
                            {p.anonymous ? "Anonymous" : p.supporter_username || "Supporter"}
                        </span>
                        </div>

                        {p.comment && <div className="pledgeItem__comment">{p.comment}</div>}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="muted">No pledges yet. Be the first to help.</p>
                )}
            </section>
            </aside>
        </div>
        </main>
    );
    }

    export default FundraiserPage;
