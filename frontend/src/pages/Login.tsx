import { Auth } from "@supabase/auth-ui-react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../../supabaseClient"
import { Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "../style/auth.css"

interface LoginProps {
    session: Session | null;
}

export default function Login({ session }: LoginProps) {
    if (session) return <Navigate to="/app" replace />;

    return (
        <div className="auth-container">
            <Navbar />
            <div className="auth-card">
                <div className="auth-box">
                    <h1>Login</h1>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            style: {
                                container: {
                                    background: "transparent",
                                    width: "100%",
                                },
                                label: {
                                    display: "none",
                                },
                                input: {
                                    background: "rgba(255, 255, 255, 0.9)",
                                    border: "1px solid rgba(139, 69, 19, 0.3)",
                                    borderRadius: "25px",
                                    padding: "12px 16px",
                                    marginBottom: "12px",
                                    fontSize: "14px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                },
                                button: {
                                    background: "white",
                                    color: "#8b4513",
                                    border: "1px solid rgba(139, 69, 19, 0.3)",
                                    borderRadius: "25px",
                                    padding: "12px",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    width: "100%",
                                    marginTop: "8px",
                                    cursor: "pointer",
                                },
                                anchor: {
                                    color: "#8b7355",
                                    fontSize: "13px",
                                    textDecoration: "none",
                                },
                                divider: {
                                    display: "none",
                                },
                            },
                            variables: {
                                default: {
                                    colors: {
                                        brand: "#8b4513",
                                        brandAccent: "#8b4513",
                                        inputBackground: "rgba(255, 255, 255, 0.9)",
                                        inputBorder: "rgba(139, 69, 19, 0.3)",
                                        inputText: "#333",
                                        inputPlaceholder: "#999",
                                    },
                                    space: {
                                        inputPadding: "12px 16px",
                                        buttonPadding: "12px",
                                    },
                                    borderWidths: {
                                        buttonBorderWidth: "1px",
                                        inputBorderWidth: "1px",
                                    },
                                    radii: {
                                        borderRadiusButton: "25px",
                                        buttonBorderRadius: "25px",
                                        inputBorderRadius: "25px",
                                    },
                                },
                            },
                        }}
                        providers={["google", "github"]}
                        view="sign_in"
                        showLinks={true}
                    />
                </div>
            </div>
        </div>
    );
}
