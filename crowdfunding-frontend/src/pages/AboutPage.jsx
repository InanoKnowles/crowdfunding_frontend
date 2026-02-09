import "./AboutPage.css";

function AboutPage() {
    return (
    <main className="container section about-page">
        <header className="about-page__header">
        <h1>About Shelter</h1>
        <p>
            Shelter is a community-driven crowdfunding platform supporting people experiencing homelessness
            across Australia. We focus on practical, urgent help and long-term pathways to stability.
        </p>
        </header>

        <section className="about-page__grid">
        <article className="about-page__card">
            <h2>Our mission</h2>
            <p>
            Help Australians experiencing homelessness access essential support through transparent, local
            fundraising and community partnerships.
            </p>
        </article>

        <article className="about-page__card">
            <h2>How it works</h2>
            <ul className="about-page__list">
            <li>Supporters donate to fundraisers they care about.</li>
            <li>Funds are directed towards verified needs and trusted services.</li>
            <li>Updates keep donors informed and accountable.</li>
            </ul>
        </article>

        <article className="about-page__card">
            <h2>Transparency</h2>
            <p>
            We aim to show clear fundraising goals, progress, and outcomes so donors feel confident their
            support is making a difference.
            </p>
        </article>
        </section>
    </main>
    );
}

export default AboutPage;
