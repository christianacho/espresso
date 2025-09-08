
import { useState } from 'react'
import { Auth } from "@supabase/auth-ui-react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../../supabaseClient"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "../style/Login.css"

interface LoginProps {
    session: Session | null;
}

export default function Login({ session }: LoginProps) {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (session) {
            navigate("/dashboard", { replace: true });
        }
    }, [session, navigate]);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('Successfully signed in!');
                // Session will be handled by useEffect
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                setError(error.message);
            } else if (data.user && !data.session) {
                // If email confirmation is still enabled, show message
                setMessage('Check your email for the confirmation link!');
                setEmail('');
                setPassword('');
            } else if (data.session) {
                // If email confirmation is disabled, user is automatically signed in
                setMessage('Account created successfully! You are now signed in.');
                // Session will be handled by useEffect, which will redirect to dashboard
            } else {
                setMessage('Account created successfully!');
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                }
            });

            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                }
            });

            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/dashboard`,
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('Check your email for the password reset link!');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (session) return <Navigate to="/app" replace />;
    const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");

    return (
        <div className="auth-main">
            <Navbar />
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-box">
                    <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

                    {/* Error and Success Messages */}
                    {error && (
                        <div style={{
                            color: '#dc2626',
                            background: 'rgba(252, 165, 165, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div style={{
                            color: '#059669',
                            background: 'rgba(167, 243, 208, 0.1)',
                            border: '1px solid rgba(5, 150, 105, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                background: "rgba(255, 255, 255, 0.9)",
                                border: "1px solid rgba(139, 69, 19, 0.3)",
                                borderRadius: "25px",
                                padding: "12px 16px",
                                marginBottom: "12px",
                                fontSize: "14px",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                background: "rgba(255, 255, 255, 0.9)",
                                border: "1px solid rgba(139, 69, 19, 0.3)",
                                borderRadius: "25px",
                                padding: "12px 16px",
                                marginBottom: "12px",
                                fontSize: "14px",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: "white",
                                color: "#8b4513",
                                border: "1px solid rgba(139, 69, 19, 0.3)",
                                borderRadius: "25px",
                                padding: "12px",
                                fontWeight: "600",
                                fontSize: "14px",
                                width: "100%",
                                marginTop: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    {/* Toggle between Sign In and Sign Up */}
                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setMessage('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#8b7355',
                                fontSize: '13px',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{
                        background: "rgba(139, 69, 19, 0.2)",
                        height: "1px",
                        margin: "16px 0",
                        position: "relative"
                    }}>
                        <span style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'white',
                            padding: '0 16px',
                            color: '#8b7355',
                            fontSize: '13px'
                        }}>
                            or
                        </span>
                    </div>

                    {/* OAuth Buttons */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            background: "white",
                            color: "#8b4513",
                            border: "1px solid rgba(139, 69, 19, 0.3)",
                            borderRadius: "25px",
                            padding: "12px",
                            fontWeight: "600",
                            fontSize: "14px",
                            width: "100%",
                            marginBottom: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        Sign in with Google
                    </button>

                    <button
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                        style={{
                            background: "white",
                            color: "#8b4513",
                            border: "1px solid rgba(139, 69, 19, 0.3)",
                            borderRadius: "25px",
                            padding: "12px",
                            fontWeight: "600",
                            fontSize: "14px",
                            width: "100%",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        Sign in with GitHub
                    </button>
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