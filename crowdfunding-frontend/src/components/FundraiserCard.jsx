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
    const shortDescription =
        description.length > 110
            ? `${description.slice(0, 110)}…`
            : description || "No description provided.";

    return (
        <Link to={link} className="fc" aria-label={`Open fundraiser: ${title}`}>
            <div className="fc__media">
                <img
                    className="fc__img"
                    src={fundraiserData.image}
                    alt={title}
                    loading="lazy"
                />
                <span
                    className={`fc__pill ${
                        isOpen ? "fc__pill--open" : "fc__pill--closed"
                    }`}
                >
                    {isOpen ? "Open" : "Closed"}
                </span>
            </div>

            <div className="fc__body">
                <div className="fc__top">
                    <h3 className="fc__title">{title}</h3>
                    <div className="fc__right">
                        <div className="fc__line">
                            <span className="fc__label">Amount:</span>
                            <span className="fc__value">
                                ${goal.toLocaleString("en-AU")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="fc__mid">
                    <div className="fc__line">
                        <span className="fc__label">Created by:</span>
                        <span className="fc__value fc__value--normal">
                            {owner}
                        </span>
                    </div>

                    <div className="fc__right">
                        <div className="fc__line">
                            <span className="fc__label">Due by:</span>
                            <span className="fc__value">{deadlineText}</span>
                        </div>
                    </div>
                </div>

                <div className="fc__bottom">
                    <span className="fc__label">Description: </span>
                    <span className="fc__desc">{shortDescription}</span>
                </div>

                <div className="fc__raisedRow" aria-label="Raised so far">
                    <span className="fc__raisedText">
                        Raised:{" "}
                        <strong>${raised.toLocaleString("en-AU")}</strong>
                    </span>

                    <span className="fc__goalText">
                        Goal:{" "}
                        <strong>${goal.toLocaleString("en-AU")}</strong>
                    </span>
                </div>

                {pledgedAmount != null && (
                    <div className="fc__pledgeNote">
                        You pledged{" "}
                        <strong>
                            ${Number(pledgedAmount).toLocaleString("en-AU")}
                        </strong>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default FundraiserCard;