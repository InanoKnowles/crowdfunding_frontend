import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useFundraiser from "../hooks/use-fundraiser";
import "./FundraiserPage.css";

function FundraiserPage() {
const { id } = useParams();
const { fundraiser, isLoading, error } = useFundraiser(id);

const totalPledged = useMemo(() => {
    if (!fundraiser?.pledges) return 0;
    return fundraiser.pledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}, [fundraiser]);

const goalAmount = Number(fundraiser?.goal ?? 0);
const isClosedByGoal = goalAmount > 0 && totalPledged >= goalAmount;

const isOpen =
    typeof fundraiser?.is_open === "boolean"
        ? fundraiser.is_open && !isClosedByGoal
        : !isClosedByGoal;

const statusText = isOpen ? "Open" : "Closed";

const progressPct =
    goalAmount > 0 ? Math.min(100, Math.round((totalPledged / goalAmount) * 100)) : 0;

const token = localStorage.getItem("token");
const isLoggedIn = Boolean(token);
const API_URL = import.meta.env.VITE_API_URL;

const [pledgeForm, setPledgeForm] = useState({
    amount: "",
    comment: "",
    anonymous: false,
});

const [pledgeStatus, setPledgeStatus] = useState({ state: "idle", message: "" });

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
        setPledgeStatus({ state: "error", message: "This fundraiser is closed and cannot accept pledges." });
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
            const msg = data?.detail || JSON.stringify(data) || "Failed to make pledge";
            throw new Error(msg);
        }

        setPledgeStatus({ state: "success", message: " Thanks for your pledge. Your support matters. " });
        setPledgeForm({ amount: "", comment: "", anonymous: false });

        window.location.reload();
    } catch (err) {
        setPledgeStatus({ state: "error", message: err.message || "Something went wrong." });
    }
    }

    if (isLoading) return <main className="container section">Loading…</main>;
    if (error) return <main className="container section">{error.message}</main>;
    if (!fundraiser) return <main className="container section">Fundraiser not found.</main>;

    return (
    <main className="container section fundraiser">
        <header className="fundraiser__header">
        <div className="fundraiser__titleRow">
            <h1 className="fundraiser__title">{fundraiser.title}</h1>
            <span className={`statusPill ${isOpen ? " statusPill--open " : " statusPill--closed "}`}>
            {statusText}
            </span>
        </div>

        <p className="fundraiser__meta">
            Created {new Date(fundraiser.date_created).toLocaleString("en-AU")}
        </p>
        </header>

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

            <div className="progressBar" aria-label="Fundraising progress">
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
            <p className="pledgeCard__subtitle">
                Your donation helps fund safe support for people experiencing homelessness.
            </p>

            {!isLoggedIn ? (
                <div className="notice">
                Please log in to make a pledge.
                </div>
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
                    placeholder="50"
                    required
                    disabled={!isOpen || pledgeStatus.state === "submitting"}
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
                    placeholder="Leave a supportive message…"
                    disabled={!isOpen || pledgeStatus.state === "submitting"}
                    />
                </label>

                <label className="checkRow">
                    <input
                    name="anonymous"
                    type="checkbox"
                    checked={pledgeForm.anonymous}
                    onChange={handlePledgeChange}
                    disabled={!isOpen || pledgeStatus.state === "submitting"}
                    />
                    Pledge anonymously
                </label>

                <button className="button button--primary" type="submit" disabled={!isOpen || pledgeStatus.state === "submitting"}>
                    {pledgeStatus.state === "submitting" ? "Submitting…" : "Pledge now"}
                </button>

                {!isOpen && (
                    <p className="muted">This fundraiser is closed and no longer accepting pledges.</p>
                )}

                {pledgeStatus.state !== "idle" && (
                    <p
                    className={
                        pledgeStatus.state === "success"
                        ? "formStatus formStatus--success"
                        : "formStatus formStatus--error"
                    }
                    role="status"
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

                    {p.comment ? <div className="pledgeItem__comment">{p.comment}</div> : null}
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