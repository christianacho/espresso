import '../style/Navbar.css'

export default function Navbar() {
    return (
        <nav className="navbar">
        <div className="navbar-links">
            <a href="/" className="navbar-link home-link">brew.ai</a>
            <a href="/faq" className="navbar-link faq-button">FAQ</a>
            <a href="/login" className="navbar-link login-button">Login</a>
        </div>
        </nav>

    )
};