// src/pages/Dashboard.tsx
import type { Session } from "@supabase/supabase-js"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabaseClient"
import SignedNavBar from "../components/SignedInNav"
import "../style/Dashboard.css"

export default function Dashboard({ session }: { session: Session }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

  return (
    <div className="dash-main">
        <SignedNavBar />
        <h1>Dashboard</h1>

    </div>
  );
}
