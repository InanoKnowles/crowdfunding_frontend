import { useParams } from "react-router-dom";
import useFundraiser from "../hooks/use-fundraiser";
import "./FundraiserPage.css";

function FundraiserPage() {
    const { id } = useParams();
    const { fundraiser, isLoading, error } = useFundraiser(id);

    if (isLoading) return <p className="container section">Loading…</p>;
    if (error) return <p className="container section">{error.message}</p>;

    return (
    <main className="container section fundraiser-page">
        <header className="fundraiser-page__header">
        <h1 className="fundraiser-page__title">{fundraiser.title}</h1>
        <p className="fundraiser-page__meta">Created: {fundraiser.date_created}</p>
        <p className="fundraiser-page__meta">
            Status: {fundraiser.is_open ? "Open" : "Closed"}
        </p>
        </header>

        <section className="fundraiser-page__section">
        <h2>Pledges</h2>

        {fundraiser.pledges.length === 0 ? (
            <p>No pledges yet.</p>
        ) : (
            <ul className="fundraiser-page__pledges">
            {fundraiser.pledges.map((pledge, index) => (
                <li className="fundraiser-page__pledge" key={pledge.id ?? index}>
                <span className="amount">${pledge.amount}</span>
                <span className="by"> by {pledge.supporter}</span>
                </li>
            ))}
            </ul>
        )}
        </section>
    </main>
    );
}

export default FundraiserPage;
