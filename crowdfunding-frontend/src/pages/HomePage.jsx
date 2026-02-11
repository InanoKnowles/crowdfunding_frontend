    import { useEffect, useMemo, useState } from "react";
    import FundraiserCard from "../components/FundraiserCard.jsx";
    import useFundraisers from "../hooks/use-fundraisers.js";
    import "./HomePage.css";
    import "./FundraisersPage.css";

    function HomePage() {
    const { fundraisers, isLoading, error, refetch } = useFundraisers();
    const [query, setQuery] = useState("");
    const [slide, setSlide] = useState(0);

    const list = useMemo(() => (Array.isArray(fundraisers) ? fundraisers : []), [fundraisers]);

    const isOpenFundraiser = (f) => {
        if (typeof f?.computed_is_open === "boolean") return f.computed_is_open;
        if (typeof f?.is_open === "boolean") return f.is_open;
        return false;
    };

    const parseDeadline = (f) => {
        if (!f?.deadline) return null;
        const d = new Date(f.deadline);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const matchesQuery = (f, q) => {
        if (!q) return true;
        const title = (f?.title || "").toLowerCase();
        const desc = (f?.description || "").toLowerCase();
        const owner = (f?.owner_username || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || owner.includes(q);
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return list.filter((f) => matchesQuery(f, q));
    }, [list, query]);

    const openDueSoonest = useMemo(() => {
        const openOnly = filtered.filter(isOpenFundraiser);
        return openOnly
        .slice()
        .sort((a, b) => {
            const ad = parseDeadline(a);
            const bd = parseDeadline(b);

            const at = ad ? ad.getTime() : Number.POSITIVE_INFINITY;
            const bt = bd ? bd.getTime() : Number.POSITIVE_INFINITY;

            if (at !== bt) return at - bt;

            const ac = a?.date_created ? new Date(a.date_created).getTime() : 0;
            const bc = b?.date_created ? new Date(b.date_created).getTime() : 0;
            return bc - ac;
        });
    }, [filtered]);

    const topActive3 = useMemo(() => openDueSoonest.slice(0, 3), [openDueSoonest]);

    useEffect(() => {
        if (topActive3.length <= 1) return;
        const t = window.setInterval(() => {
        setSlide((prev) => (prev + 1) % topActive3.length);
        }, 6000);
        return () => window.clearInterval(t);
    }, [topActive3.length]);

    useEffect(() => {
        if (slide >= topActive3.length) setSlide(0);
    }, [topActive3.length, slide]);

    const stats = useMemo(() => {
        const totalFundraisers = list.length;

        const totalRaised = list.reduce((sum, f) => {
        const v = Number(f?.total_pledged || 0);
        return sum + (Number.isFinite(v) ? v : 0);
        }, 0);

        const peopleHelped = list.reduce((count, f) => {
        return count + (isOpenFundraiser(f) ? 0 : 1);
        }, 0);

        return { totalFundraisers, totalRaised, peopleHelped };
    }, [list]);

    const carouselItem = topActive3[slide] || null;

    return (
        <main className="container section homePage">
        <section className="homeBlock homeSearch">
            <div className="homeSearch__row">
            <h1 className="homeTitle">
                Welcome {localStorage.getItem("username") || "Visitor"}
            </h1>

            <div className="searchBar homeSearch__bar">
                <input
                className="searchBar__input homeSearch__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fundraisers by title, description or creator…"
                aria-label="Search fundraisers"
                />
            </div>
            </div>

            <p className="homeSub">
            Supporting people experiencing homelessness across Australia.
            </p>
        </section>

        <section className="homeBlock homeStats">
            <h2 className="homeBlock__title">Impact so far</h2>

            <div className="homeStats__grid">
            <div className="homeStat">
                <div className="homeStat__label">Fundraisers created</div>
                <div className="homeStat__value">{stats.totalFundraisers.toLocaleString("en-AU")}</div>
            </div>

            <div className="homeStat">
                <div className="homeStat__label">Total raised</div>
                <div className="homeStat__value">
                ${stats.totalRaised.toLocaleString("en-AU")}
                </div>
            </div>

            <div className="homeStat">
                <div className="homeStat__label">People helped</div>
                <div className="homeStat__value">{stats.peopleHelped.toLocaleString("en-AU")}</div>
            </div>
            </div>
        </section>

        <section className="homeBlock homeCarousel">
            <div className="homeCarousel__header">
            <h2 className="homeBlock__title">Top 3 Fundraisers Closing Soon</h2>

            <div className="homeCarousel__controls">
                <button
                type="button"
                className="homeCarousel__btn"
                onClick={() => setSlide((s) => (topActive3.length ? (s - 1 + topActive3.length) % topActive3.length : 0))}
                disabled={topActive3.length <= 1}
                aria-label="Previous active fundraiser"
                >
                Prev
                </button>

                <button
                type="button"
                className="homeCarousel__btn"
                onClick={() => setSlide((s) => (topActive3.length ? (s + 1) % topActive3.length : 0))}
                disabled={topActive3.length <= 1}
                aria-label="Next active fundraiser"
                >
                Next
                </button>
            </div>
            </div>

            {isLoading ? (
            <div className="homeCarousel__empty">Loading…</div>
            ) : error ? (
            <div className="homeCarousel__empty">Could not load fundraisers.</div>
            ) : !carouselItem ? (
            <div className="homeCarousel__empty">No active fundraisers available.</div>
            ) : (
            <div className="homeCarousel__card">
                <FundraiserCard fundraiserData={carouselItem} />
                <div className="homeCarousel__dots" aria-label="Carousel position">
                {topActive3.map((_, i) => (
                    <button
                    key={i}
                    type="button"
                    className={i === slide ? "homeCarousel__dot homeCarousel__dot--active" : "homeCarousel__dot"}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
                </div>
            </div>
            )}
        </section>

        <section className="homeBlock">
            <div className="homeHeaderRow">
            <h2 className="homeBlock__title">Active fundraisers</h2>

            <button type="button" className="homeRefresh" onClick={refetch}>
                Refresh
            </button>
            </div>

            {isLoading ? (
            <p className="fundraisersBlock__sub">Loading…</p>
            ) : error ? (
            <p className="fundraisersBlock__sub">Could not load fundraisers.</p>
            ) : openDueSoonest.length ? (
            <div className="fundraiserGrid">
                {openDueSoonest.map((f) => (
                <FundraiserCard key={f.id} fundraiserData={f} />
                ))}
            </div>
            ) : (
            <p className="fundraisersBlock__sub">No open fundraisers match your search.</p>
            )}
        </section>

        </main>
    );
    }

    export default HomePage;
