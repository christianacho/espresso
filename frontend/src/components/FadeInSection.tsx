import { useState, useEffect, useRef } from "react"
import type { ReactNode } from "react"

interface FadeInSectionProps {
  children: ReactNode;
}

export default function FadeInSection({ children }: FadeInSectionProps) {
    const [showHook, setShowHook] = useState(false);
    const domRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
    const node = domRef.current;
        if (!node) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => setShowHook(entry.isIntersecting));
    });

    observer.observe(node);
    return () => observer.unobserve(node);
    }, []);

    return (
    <div className={`fade-in-section ${showHook ? "is-visible" : ""}`} ref={domRef}>
        {children}
    </div>
  );
}
