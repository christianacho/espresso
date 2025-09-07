import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Faq from "./pages/Faq";
import Dashboard from "./pages/Dashboard"; // private placeholder
import "./App.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // adjust if yours is in ./lib/supabaseClient
import type { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home session={session} />} />
      <Route path="/login" element={<Login session={session} />} />
      <Route path="/faq" element={<Faq />} />

      {/* Protected routes */}
      <Route
        path="/app"
        element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
