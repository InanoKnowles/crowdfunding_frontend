import { Link } from "react-router-dom";
import "./FundraiserCard.css";

function FundraiserCard({ fundraiserData }) {
    const fundraiserLink = `/fundraiser/${fundraiserData.id}`;

    return (
    <article className="fundraiser-card">
        <Link className="fundraiser-card__link" to={fundraiserLink}>
        <img
            className="fundraiser-card__image"
            src={fundraiserData.image}
            alt={fundraiserData.title}
            loading="lazy"
        />
        <div className="fundraiser-card__content">
            <h3 className="fundraiser-card__title">{fundraiserData.title}</h3>
        </div>
        </Link>
    </article>
    );
}

export default FundraiserCard;
