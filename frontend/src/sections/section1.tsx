import { useState, useEffect } from 'react';
import '../style/Section1.css';
import '../style/Home.css';
import Navbar from '../components/Navbar';

export default function Section1() {
    const name = "brew.ai";
    const [displayed, setDisplayed] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const cursorActive = true;
    const [showSubtext, setShowSubtext] = useState(false);
    const [showArrow, setShowArrow] = useState(true);

    useEffect(() => {
        if (displayed.length < name.length) {
            const timeout = setTimeout(() => {
                setDisplayed(name.slice(0, displayed.length + 1));
            }, 200);
            return () => clearTimeout(timeout);
        } else {
            const subtextTimeout = setTimeout(() => setShowSubtext(true), 400);
            return () => { clearTimeout(subtextTimeout); };
        }
    }, [displayed, name]);

    useEffect(() => {
        if (!showCursor) return;
        const cursorInterval = setInterval(() => {
            setShowCursor((c) => !c);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, [cursorActive]);

    useEffect(() => {
        const section = document.getElementById('second-section');
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShowArrow(false);
                    } else {
                        setShowArrow(true);
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );

        observer.observe(section);
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="page-section home-container" id="first-section">
            <Navbar />
            <h1 className="home-title">
                {displayed}
                <span
                    className="home-cursor"
                    style={{ opacity: showCursor ? 1 : 0 }}
                >|</span>
            </h1>
            <p className={`home-subtext${showSubtext ? " visible" : ""}`}>
                For your flowing schedule, even when it overflows
            </p>
            <div
                className={`scroll-arrow ${showArrow ? "visible" : "hidden"}`}
                onClick={() => {
                    const section = document.getElementById("second-section");
                    if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label="Scroll to next section"
            >
                &#8595;
            </div>
        </div>
    );
}