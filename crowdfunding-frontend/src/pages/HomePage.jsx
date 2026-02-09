    import useFundraisers from "../hooks/use-fundraisers.js";
    import FundraiserCard from "../components/FundraiserCard.jsx";

    function HomePage() {
    const { fundraisers, isLoading } = useFundraisers();
    const username = localStorage.getItem("username");

    const activeFundraisers = fundraisers.filter(
        (f) => f.computed_is_open === true
    );

    return (
        <main className="container section">
        <header className="homeHeader">
            <h1>Welcome {username ? username : "Visitor"}</h1>
            <p className="muted">
            Supporting people experiencing homelessness across Australia.
            </p>
        </header>

        <section>
            <h2>Active fundraisers</h2>

            {isLoading ? (
            <p>Loading…</p>
            ) : (
            <div id="fundraiser-list">
                {activeFundraisers.map((f) => (
                <FundraiserCard key={f.id} fundraiserData={f} />
                ))}
            </div>
            )}
        </section>
        </main>
    );
    }

    export default HomePage;
