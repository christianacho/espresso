import type { Session } from "@supabase/supabase-js"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabaseClient"
import '../style/Navbar.css'

export default function SignedNavBar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <nav className="navbar">
        <div className="navbar-links">
            <a href="/" className="navbar-link home-link">brew.ai</a>
            <a href="/faq" className="navbar-link faq-button">FAQ</a>
             <button className="logout-button navbar-link" onClick={handleLogout}>
                Log out
            </button>
        </div>
        </nav>

    )
};