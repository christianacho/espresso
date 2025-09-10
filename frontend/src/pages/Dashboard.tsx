import React, { useState, useEffect } from 'react';
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";

interface WelcomeFlowProps {
  session: Session;
  onComplete: (name: string) => void;
}

export default function WelcomeFlow({ session, onComplete }: WelcomeFlowProps) {
  const [name, setName] = useState('');
  const [currentStep, setCurrentStep] = useState<'prompt' | 'welcome' | 'complete'>('prompt');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      // Save the user's name to their profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          display_name: name.trim(),
          onboarded: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
      }

      // Transition to welcome message
      setCurrentStep('welcome');

      // After showing welcome, transition to dashboard
      setTimeout(() => {
        setCurrentStep('complete');
        setTimeout(() => {
          onComplete(name.trim());
        }, 500);
      }, 2000);

    } catch (error) {
      console.error('Error during onboarding:', error);
      setCurrentStep('welcome');
      setTimeout(() => {
        setCurrentStep('complete');
        setTimeout(() => {
          onComplete(name.trim());
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
              <h1>Welcome to Brew.AI!</h1>
              <p>Let's get you set up with a personalized experience</p>
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