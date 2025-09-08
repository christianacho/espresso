import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Faq from "./pages/Faq"
import About from "./pages/About"
import Dashboard from "./pages/Dashboard"
import "./App.css"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { Session } from "@supabase/supabase-js"

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
      <Route
        path="/dashboard"
        element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />}
      />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
