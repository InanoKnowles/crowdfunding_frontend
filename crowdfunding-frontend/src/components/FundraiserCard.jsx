    import { Link } from "react-router-dom";
    import "./FundraiserCard.css";

    function FundraiserCard({ fundraiserData, pledgedAmount }) {
    const link = `/fundraiser/${fundraiserData.id}`;

    const isOpen =
        typeof fundraiserData.computed_is_open === "boolean"
        ? fundraiserData.computed_is_open
        : Boolean(fundraiserData.is_open);

    const title = fundraiserData.title || "Untitled fundraiser";
    const owner = fundraiserData.owner_username || "Unknown";
    const goal = Number(fundraiserData.goal || 0);
    const raised = Number(fundraiserData.total_pledged || 0);

    const deadlineText = fundraiserData.deadline
        ? new Date(fundraiserData.deadline).toLocaleDateString("en-AU")
        : "No deadline";

    const description = (fundraiserData.description || "").trim();

    return (
        <Link to={link} className="fc">
        <div className="fc__media">
            <img
            className="fc__img"
            src={fundraiserData.image}
            alt={title}
            loading="lazy"
            />
            <span className={`fc__pill ${isOpen ? "fc__pill--open" : "fc__pill--closed"}`}>
            {isOpen ? "Open" : "Closed"}
            </span>
        </div>

        <div className="fc__content">
            <h3 className="fc__title">{title}</h3>

            <p className="fc__desc">{description}</p>

            <div className="fc__meta">
            <div className="fc__row">
                <span className="fc__label">Raised: </span>
                <span className="fc__value">
                ${raised.toLocaleString("en-AU")}
                </span>
            </div>

            <div className="fc__row">
                <span className="fc__label">Goal: </span>
                <span className="fc__value">
                ${goal.toLocaleString("en-AU")}
                </span>
            </div>

            <div className="fc__footer">
            <span className="fc__footerItem">
                <strong>Due: </strong> {deadlineText}
            </span>
            </div>

            <span className="fc__footerItem">
                <strong> Created By: </strong> {owner}
            </span>

            {typeof pledgedAmount === "number" && (
                <div className="fc__row fc__row--pledged">
                You pledged ${pledgedAmount.toLocaleString("en-AU")}
                </div>
            )}
            </div>

        </div>
        </Link>
    );
    }

    export default FundraiserCard;
