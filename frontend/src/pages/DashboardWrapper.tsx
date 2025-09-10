import { useState, useEffect } from 'react';
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import Dashboard from './Dashboard';
import WelcomeFlow from './WelcomeFlow';

interface UserProfile {
    id: string;
    display_name?: string;
    onboarded?: boolean;
}

export default function DashboardWrapper({ session }: { session: Session }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        checkUserProfile();
    }, [session.user.id]);

    const checkUserProfile = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, display_name, onboarded')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (!profile || !profile.onboarded) {
                setShowWelcome(true);
                setUserProfile(null);
            } else {
                setUserProfile(profile);
                setShowWelcome(false);
            }
        } catch (error) {
            console.error('Error checking user profile:', error);
            // If there's an error, show welcome flow to be safe
            setShowWelcome(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWelcomeComplete = (name: string) => {
        setUserProfile({
            id: session.user.id,
            display_name: name,
            onboarded: true
        });
        setShowWelcome(false);
    };

    if (isLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #F5EDE3 0%, #E8D5C2 100%)'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(166, 124, 82, 0.2)',
                    borderTop: '4px solid #A67C52',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    if (showWelcome) {
        return (
            <WelcomeFlow
                session={session}
                onComplete={handleWelcomeComplete}
            />
        );
    }

    return <Dashboard session={session} userProfile={userProfile} />;
}