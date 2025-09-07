// src/pages/Dashboard.tsx
import type { Session } from "@supabase/supabase-js";

export default function Dashboard({ session }: { session: Session }) {
    return (
        <div className="flex items-center justify-center h-screen">
            <h1>Welcome to your Dashboard 🚀</h1>
            <pre>{JSON.stringify(session.user, null, 2)}</pre>
        </div>
    );
}
