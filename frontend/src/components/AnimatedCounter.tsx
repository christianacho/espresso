import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
    end: number;
    suffix?: string;
    duration?: number;
    className?: string;
}
export default function AnimatedCounter({ end, suffix = '', duration = 1500, className }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const counterRef = useRef<HTMLDivElement | null>(null);

    const animate = () => {
        const start = Date.now();

        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = Math.floor(end * easeOutQuart);
            setCount(value);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        setCount(0);
        requestAnimationFrame(tick);
    };

    useEffect(() => {
        const node = counterRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    animate();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <div ref={counterRef} className={className}>
            {count}{suffix}
        </div>
    );
}