    import { Link } from "react-router-dom";
    import "./Footer.css";

    function Footer() {
    return (
        <footer className="footer">
        <div className="footer__inner">
            <div className="footer__brand">

            
            <span>© {new Date().getFullYear()}         Built with love by Inano Knowles</span>
            </div>
        </div>
        </footer>
    );
    }

    export default Footer;
