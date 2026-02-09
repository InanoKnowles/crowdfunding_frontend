    import { NavLink, Link, useNavigate } from "react-router-dom";
    import { useAuth } from "./AuthProvider.jsx";
    import "./NavBar.css";

    function NavBar() {
    const { token, username, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <header className="nav">
        <div className="nav__inner container">
            <div className="nav__left">
            <Link to="/" className="nav__brand" aria-label="Go to Home">
                <span className="nav__brandTitle">Shelter</span>
                <span className="nav__brandTagline">Crowdfunding for homelessness support</span>
            </Link>
            </div>

            <nav className="nav__links" aria-label="Primary">
            <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            >
                Home
            </NavLink>

            <NavLink
                to="/fundraisers"
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            >
                Fundraisers
            </NavLink>

            <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            >
                About
            </NavLink>

            <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            >
                Contact
            </NavLink>

            {token ? (
                <button type="button" className="nav__button" onClick={handleLogout}>
                Log Out{username ? ` (${username})` : ""}
                </button>
            ) : (
                <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
                >
                Login
                </NavLink>
            )}
            </nav>
        </div>
        </header>
    );
    }

    export default NavBar;
