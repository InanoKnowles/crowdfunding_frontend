import { Link, Outlet } from "react-router-dom";

function NavBar() {
    return (
        <nav>
        <Link to="/">Home</Link>
        <Link to="/fundraisers">Fundraisers</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        </nav>
    );
}



export default NavBar;