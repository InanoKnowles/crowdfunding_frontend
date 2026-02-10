    import { NavLink } from "react-router-dom";
    import { useAuth } from "./AuthProvider.jsx";
    import "./NavBar.css";

    function NavBar() {
    const { auth, logout } = useAuth();
    const isLoggedIn = Boolean(auth?.token);

    return (
        <header className="navWrap">
        <nav className="nav container" aria-label="Primary">
            <div className="nav__left">
            <NavLink to="/" className="nav__brand" aria-label="Shelter home">
                <span className="nav__brandName">Shelter</span>
                <span className="nav__brandTag">Crowdfunding for homelessness support</span>
            </NavLink>
            </div>

            <div className="nav__right">
            <NavLink
                to="/"
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

            {!isLoggedIn ? (
                <>
                <NavLink
                    to="/login"
                    className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
                >
                    Login
                </NavLink>

                <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                    isActive ? "nav__link nav__link--primary nav__link--active" : "nav__link nav__link--primary"
                    }
                >
                    Sign up
                </NavLink>
                </>
            ) : (
                <button type="button" className="nav__link nav__link--primary" onClick={logout}>
                Log out ({auth?.username || "user"})
                </button>
            )}
            </div>
        </nav>
        </header>
    );
    }

    export default NavBar;
