import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from "react";
import { Link } from 'react-router-dom';
import SidebarDots from './Sidebar';
import Navbar from "./Navbar";
import '../style/Home.css';

function FadeInSection({ children }: { children: ReactNode }) {
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
        <div
            className={`fade-in-section ${showHook ? "is-visible" : ""}`}
            ref={domRef}
        >
            {children}
        </div>
    );
}

export default function Home() {
    const name = "brew.ai";
    const [displayed, setDisplayed] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const cursorActive = true;
    const [showSubtext, setShowSubtext] = useState(false);
    const [showArrow, setShowArrow] = useState(true);
    const [activeWord, setActiveWord] = useState<string | null>(null);



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

    useEffect(() => {
        const words = ['deadline', 'bills', 'groceries', 'project', 'birthdays', 'appointment'];
        let currentIndex = 0;

        setActiveWord(words[currentIndex]);

        const timer = setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            setActiveWord(words[currentIndex]);
        }, 1500);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="page-wrapper">
            <SidebarDots />
            <div className="page-section home-container" id="first-section">
                <Navbar />
                <div className="login-link">
                    {/* <Link to="/login">
                        <button className="login-button">Login</button>
                    </Link> */}
                </div>
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

            <div className="page-section second-section" id="second-section">
                <FadeInSection>
                    <div className="second-text">
                        <h2 className="second-hook">
                            brew structure, <br />
                            sip <span className="hook-gradient">freedom</span>
                        </h2>

                        <p className="second-desc">
                            Brew is a smart scheduler that turns your brain-dump into a plan.
                            It uses AI to place tasks on your calendar based on time and difficulty,
                            then learns from your feedback to keep everything updated and stress-free.
                        </p>
                    </div>
                </FadeInSection>

                <FadeInSection>
                    <div className="second-image-container">
                        <img src="./images/dashboard.gif" alt="Dashboard preview" className="second-image" />
                    </div>
                </FadeInSection>
            </div>

            <div className="page-section third-section" id="third-section">
                <div className="third-content">
                    <p className="third-intro">brew's got your</p>

                    <h2 className="third-main">
                        <span className={`deadline-text ${activeWord === 'deadline' ? "masked" : ""}`}>DEADLINES </span> · {" "}
                        <span className={`project-text ${activeWord === 'project' ? "masked" : ""}`}>PROJECTS</span><br />
                        <span className={`appointment-text ${activeWord === 'appointment' ? "masked" : ""}`}>APPOINTMENTS</span>
                    </h2>

                    <p className="third-extra">and even</p>

                    <h2 className="third-casual">
                        <span className={`bills-text ${activeWord === 'bills' ? "masked" : ""}`}>BILLS</span> · {" "}
                        <span className={`groceries-text ${activeWord === 'groceries' ? "masked" : ""}`}>GROCERIES</span>{" "}<br />
                        <span className={`birthdays-text ${activeWord === 'birthdays' ? "masked" : ""}`}>BIRTHDAYS</span>
                    </h2>
                </div>
            </div>

            <div className="page-section fourth-section" id="fourth-section">
                <FadeInSection>
                    <div className="features-container">
                        <div className="feature-card">
                            <h3 className="feature-title">Focuses on What Matters</h3>
                            <p className="feature-description">
                                Brew ranks your tasks so you tackle the most important ones first
                            </p>
                            <div className="feature-visual">
                                <div className="motion-placeholder">motion design</div>
                            </div>
                        </div>

                        <div className="feature-card">
                            <h3 className="feature-title">Captures<br /> Everything</h3>
                            <p className="feature-description">
                                Drop tasks, ideas, and errands in one place and watch Brew organize them
                            </p>
                            <div className="feature-visual">
                                <div className="motion-placeholder">motion design</div>
                            </div>
                        </div>

                        <div className="feature-card">
                            <h3 className="feature-title">Adjusts on <br />Feedback</h3>
                            <p className="feature-description">
                                Brew reshuffles your schedule when tasks take longer or you fall behind
                            </p>
                            <div className="feature-visual">
                                <div className="motion-placeholder">motion design</div>
                            </div>
                        </div>
                    </div>
                </FadeInSection>
            </div>

            <div className="page-section fifth-section" id="fifth-section">
                <h2>Fifth</h2>
                <p>Sup</p>
            </div>

            <div className="page-section sixth-section" id="sixth-section">
                <h2>Sixth</h2>
                <p>Sup</p>
            </div>
        </div>
    );
}
