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
                setMessage('Account created successfully! You are now signed in.');
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
                        className="auth-input"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`auth-submit ${loading ? "disabled" : ""}`}
                    >
                        {loading
                        ? isSignUp
                            ? "Signing up..."
                            : "Signing in..."
                        : isSignUp
                        ? "Sign Up"
                        : "Sign In"}
                    </button>
                    </form>

                    <div className="auth-toggle-container">
                    <button
                        type="button"
                        onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                        setMessage("");
                        }}
                        className="auth-toggle-button sign-question"
                    >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                    </div>

                    <div className="auth-divider-line">
                    <span>or</span>
                    </div>
                    
                    <div className="oauths">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={`oauth-button ${loading ? "disabled" : ""}`}
                    >
                        Sign in with Google
                    </button>

                    <button
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                        className={`oauth-button ${loading ? "disabled" : ""}`}
                        >
                        Sign in with GitHub
                    </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}