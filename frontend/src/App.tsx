import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Faq from "./pages/Faq"
import About from "./pages/About"
import Dashboard from "./pages/Dashboard"
import ResetPassword from "./pages/ResetPassword"
import ChangePassword from "./pages/ChangePassword"
import "./App.css"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { Session } from "@supabase/supabase-js"
import DashboardWrapper from "./pages/DashboardWrapper"


export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* If logged in, redirect root "/" straight to /dashboard */}
      <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Home />} />

      <Route path="/login" element={<Login session={session} />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/about" element={<About />} />

      {/* Password Reset Routes - Publicly accessible */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Change Password Route - Requires authentication */}
      <Route
        path="/change-password"
        element={session ? <ChangePassword session={session} /> : <Navigate to="/login" replace />}
      />

      {/* Dashboard - Protected route */}
      <Route
        path="/dashboard"
        element={session ? <DashboardWrapper session={session} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}