import useFundraisers from "../hooks/use-fundraisers";
import FundraiserCard from "../components/FundraiserCard";
import "./HomePage.css";

function HomePage() {
    const { fundraisers, isLoading, error } = useFundraisers();

    if (isLoading) {
        return <p>Loading fundraisers...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
    <div id="fundraiser-list">
        {fundraisers.length === 0 ? (
        <p>No fundraisers yet.</p>
        ) : (
        fundraisers.map((fundraiserData) => (
            <FundraiserCard key={fundraiserData.id} fundraiserData={fundraiserData} />
        ))
        )}
    </div>
    );
}

export default HomePage;
