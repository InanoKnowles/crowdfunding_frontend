import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./NavBar.css";

function NavBar() {
    const [open, setOpen] = useState(false);

    function closeMenu() {
    setOpen(false);
    }

    return (
    <header className="site-header">
        <div className="container site-header__inner">
        <NavLink to="/" className="brand" onClick={closeMenu}>
            <span className="brand__name">Shelter</span>
            <span className="brand__tag">Crowdfunding for homelessness support</span>
        </NavLink>

        <button
            className="nav-toggle"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
        >
            <span className="nav-toggle__bar" />
            <span className="nav-toggle__bar" />
            <span className="nav-toggle__bar" />
        </button>

        <nav className={`nav ${open ? "nav--open" : ""}`} aria-label="Primary">
            <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            onClick={closeMenu}
            end
            >
            Home
            </NavLink>

            <NavLink
            to="/fundraisers"
            className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            onClick={closeMenu}
            >
            Fundraisers
            </NavLink>

            <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            onClick={closeMenu}
            >
            About
            </NavLink>

            <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
            onClick={closeMenu}
            >
            Contact
            </NavLink>
        </nav>
        </div>
    </header>
    );
}

export default NavBar;
