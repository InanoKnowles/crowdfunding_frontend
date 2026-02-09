    import { Link } from "react-router-dom";

    function PledgeRow({ pledge }) {
    return (
        <div className="pledgeRow">
        <div>
            <strong>${Number(pledge.amount).toLocaleString("en-AU")}</strong>
            <div className="muted">
            {pledge.anonymous ? "Anonymous pledge" : "You pledged"}
            </div>
        </div>

        <Link to={`/fundraiser/${pledge.fundraiser}`}>
            View fundraiser
        </Link>
        </div>
    );
    }

    export default PledgeRow;
