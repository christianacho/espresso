import { useState, useEffect } from "react"
import { supabase } from "../../supabaseClient"
import { useNavigate } from "react-router-dom"
import type { Session } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import '../style/Login.css'

interface ChangePasswordProps {
    session: Session | null;
}

export default function ChangePassword({ session }: ChangePasswordProps) {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // If no session, redirect to login
        if (!session) {
            navigate("/login", { replace: true });
        }
    }, [session, navigate]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validation
        if (!newPassword) {
            setError('Please enter a new password');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('Password updated successfully! Redirecting to dashboard...');
                setNewPassword('');
                setConfirmPassword('');

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 2000);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Don't render if no session (will redirect)
    if (!session) {
        return <div>Redirecting...</div>;
    }

    return (
        <div className="auth-container">
            <Navbar />
            <div className="auth-card">
                <div className="auth-box">
                    <h1>Change Password</h1>
                    <p style={{
                        color: '#8b7355',
                        fontSize: '14px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        Enter your new password below.
                    </p>

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

                    <form onSubmit={handlePasswordUpdate}>
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
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
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                background: "rgba(255, 255, 255, 0.9)",
                                border: "1px solid rgba(139, 69, 19, 0.3)",
                                borderRadius: "25px",
                                padding: "12px 16px",
                                marginBottom: "16px",
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
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? 'Updating password...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}