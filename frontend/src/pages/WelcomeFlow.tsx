import React, { useState } from 'react';
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../style/WelcomeFlow.css"

interface WelcomeFlowProps {
    session: Session;
    onComplete: (name: string) => void;
}

export default function WelcomeFlow({ session, onComplete }: WelcomeFlowProps) {
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<'prompt' | 'welcome' | 'complete'>('prompt');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    display_name: name.trim(),
                    onboarded: true,
                    updated_at: new Date().toISOString()
                });

            if (error) console.error(error);

            setCurrentStep('welcome');
            setTimeout(() => {
                setCurrentStep('complete');
                setTimeout(() => {
                    onComplete(name.trim());
                    navigate("/dashboard");
                }, 500);
            }, 2000);
        } catch (error) {
            console.error(error);
            setCurrentStep('welcome');
            setTimeout(() => {
                setCurrentStep('complete');
                setTimeout(() => {
                    onComplete(name.trim());
                    navigate("/dashboard");
                }, 500);
            }, 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && name.trim()) {
            handleSubmit();
        }
    };

    if (currentStep === 'prompt') {
        return (
            <div className="welcome-overlay">
                <div className="welcome-container">
                    <div className="welcome-card fade-in">
                        <div className="welcome-header">
                            <h1 className="welcome-title">Welcome to Brew.AI!</h1>
                            <p className="welcome-word">Let's get you set up with a personalized experience</p>
                        </div>
                        <div className="welcome-form">
                            <div className="input-group">
                                <label htmlFor="name" className="welcome-label">
                                    What can we call you?
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter your name"
                                    className="welcome-input"
                                    autoFocus
                                    maxLength={50}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="welcome-button"
                                disabled={!name.trim() || isLoading}
                            >
                                {isLoading ? 'Setting up...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'welcome') {
        return (
            <div className="welcome-overlay">
                <div className="welcome-container">
                    <div className="welcome-card welcome-message fade-in">
                        <h1 className="welcome-greeting">Welcome, {name}!</h1>
                        <p className="welcome-subtitle">Setting up your personalized dashboard...</p>
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'complete') {
        return (
            <div className="welcome-overlay fade-out">
                <div className="welcome-container">
                    <div className="welcome-card fade-out">
                        <h1 className="welcome-greeting">Welcome, {name}!</h1>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
