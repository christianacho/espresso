import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import '../style/Login.css'

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/change-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('Check your email for the password reset link!');
                setEmail('');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Navbar />
            <div className="auth-card">
                <div className="auth-box">
                    <h1>Reset Password</h1>
                    <p style={{
                        color: '#8b7355',
                        fontSize: '14px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        Enter your email address and we'll send you a link to reset your password.
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

                    <form onSubmit={handlePasswordReset}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                            {loading ? 'Sending reset email...' : 'Send Reset Email'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#8b7355',
                                fontSize: '14px',
                                textDecoration: 'none'
                            }}
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}