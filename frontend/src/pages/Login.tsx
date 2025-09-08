import { useState } from 'react'
import { Auth } from "@supabase/auth-ui-react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../../supabaseClient"
import { Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "../style/Login.css"

interface LoginProps {
    session: Session | null;
}

export default function Login({ session }: LoginProps) {
    if (session) return <Navigate to="/app" replace />;
    const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");

    return (
        <div className="auth-main">
            <Navbar />
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-box">
                    {view === "sign_in" ? (
                    <h1 className="auth-text">Login</h1>
                    ) : (
                    <h1 className="auth-sign">Sign Up</h1>
                    )}
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            className: {
                            container: "auth-container-inner",
                            label: "auth-label",
                            input: "auth-input",
                            button: "auth-button",
                            anchor: "auth-anchor",
                            divider: "auth-divider",
                            },
                        }}
                        providers={["google", "github"]}
                        view="sign_in"
                        showLinks={true} 
                        />
                    <button
                        className="auth-toggle link"
                        onClick={() =>
                            setView((prev) => (prev === "sign_in" ? "sign_up" : "sign_in"))
                        }
                        >
                        {view === "sign_in"
                            ? "Don't Have an Account? Sign Up"
                            : "Already have an account? Log In"}
                        </button>
                </div>
            </div>
        </div>
        </div>
    );
}
