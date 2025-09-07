import React, { useState, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import SidebarDots from "./Sidebar"
import Navbar from "./Navbar"
import { supabase } from "../../supabaseClient"
import "../style/Home.css"

function FadeInSection({ children }: { children: ReactNode }) {
    const [showHook, setShowHook] = useState(false)
    const domRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const node = domRef.current
        if (!node) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => setShowHook(entry.isIntersecting))
        })

        observer.observe(node)
        return () => observer.unobserve(node)
    }, [])

    return (
        <div className={`fade-in-section ${showHook ? "is-visible" : ""}`} ref={domRef}>
            {children}
        </div>
    )
}

interface AnimatedCounterProps {
    end: number
    suffix?: string
    duration?: number
    className?: string
}

function AnimatedCounter({ end, suffix = "", duration = 2000, className }: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const counterRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                    }
                })
            },
            { threshold: 0.1 }
        )

        if (counterRef.current) {
            observer.observe(counterRef.current)
        }

        return () => {
            if (counterRef.current) {
                observer.unobserve(counterRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!isVisible) return

        const startTime = Date.now()
        const startValue = 0

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart)
            setCount(currentValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(end)
            }
        }

        requestAnimationFrame(animate)
    }, [isVisible, end, duration])

    return (
        <div ref={counterRef} className={className}>
            {count}
            {suffix}
        </div>
    )
}

export default function Home({ session }: { session: any }) {
    const name = "brew.ai"
    const [displayed, setDisplayed] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const cursorActive = true
    const [showSubtext, setShowSubtext] = useState(false)
    const [showArrow, setShowArrow] = useState(true)
    const [activeWord, setActiveWord] = useState<string | null>(null)

    // typing effect
    useEffect(() => {
        if (displayed.length < name.length) {
            const timeout = setTimeout(() => {
                setDisplayed(name.slice(0, displayed.length + 1))
            }, 200)
            return () => clearTimeout(timeout)
        } else {
            const subtextTimeout = setTimeout(() => setShowSubtext(true), 400)
            return () => {
                clearTimeout(subtextTimeout)
            }
        }
    }, [displayed, name])

    // blinking cursor
    useEffect(() => {
        if (!showCursor) return
        const cursorInterval = setInterval(() => {
            setShowCursor((c) => !c)
        }, 500)
        return () => clearInterval(cursorInterval)
    }, [cursorActive])

    // arrow hide/show
    useEffect(() => {
        const section = document.getElementById("second-section")
        if (!section) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShowArrow(false)
                    } else {
                        setShowArrow(true)
                    }
                })
            },
            {
                threshold: 0.1,
            }
        )

        observer.observe(section)
        return () => {
            observer.disconnect()
        }
    }, [])

    // rotating words
    useEffect(() => {
        const words = ["deadline", "bills", "groceries", "project", "birthdays", "appointment"]
        let currentIndex = 0

        setActiveWord(words[currentIndex])

        const timer = setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length
            setActiveWord(words[currentIndex])
        }, 1500)

        return () => {
            clearInterval(timer)
        }
    }, [])

    return (
        <div className="page-wrapper">
            <SidebarDots />
            <div className="page-section home-container" id="first-section">
                <Navbar />


                <h1 className="home-title">
                    {displayed}
                    <span className="home-cursor" style={{ opacity: showCursor ? 1 : 0 }}>
                        |
                    </span>
                </h1>
                <p className={`home-subtext${showSubtext ? " visible" : ""}`}>
                    For your flowing schedule, even when it overflows
                </p>
                <div
                    className={`scroll-arrow ${showArrow ? "visible" : "hidden"}`}
                    onClick={() => {
                        const section = document.getElementById("second-section")
                        if (section) {
                            section.scrollIntoView({ behavior: "smooth" })
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
                <FadeInSection>
                    <div className="stats-container">
                        <div className="stats-left">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <AnimatedCounter end={82} suffix="%" className="stat-number" />
                                    <div className="stat-text">
                                        feel they don't manage <br />time effectively
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <AnimatedCounter end={87} suffix="%" className="stat-number" />
                                    <div className="stat-text">
                                        of high performers use <br />time-blocking
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <AnimatedCounter end={2} suffix=" hours" className="stat-number" />
                                    <div className="stat-text">
                                        per day are wasted due to <br />poor planning
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <AnimatedCounter end={30} suffix="%" className="stat-number" />
                                    <div className="stat-text">
                                        higher task completion with <br />digital calendars
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-right">
                            <h2 className="stats-headline">
                                Planning sucks,<br />
                                <span className="gradient-text">let AI handle it</span>
                            </h2>
                            <p className="stats-description">
                                AI can drive cars and write code-why can't it plan your day?<br />
                                Brew takes the wheel in scheduling your plans, optimizing your time <br />so you can focus on what matters.
                            </p>
                        </div>
                    </div>
                </FadeInSection>
            </div>

            <div className="page-section sixth-section" id="sixth-section">
                <h2>Sixth</h2>
                <p>Sup</p>
            </div>

            <footer className="footer-section">
                <div className="footer-content">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">brew.ai</div>
                        </div>

                        <div className="footer-column">
                            <h4>Features</h4>
                            <ul>
                                <li><a href="#smart-scheduling">Smart Scheduling</a></li>
                                <li><a href="#task-management">Task Management</a></li>
                                <li><a href="#ai-optimization">AI Optimization</a></li>
                                <li><a href="#calendar-sync">Calendar Sync</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#pricing">Pricing</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#contact">Contact Us</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="#help">Help Center</a></li>
                                <li><a href="#tutorials">Tutorials</a></li>
                                <li><a href="#blog">Blog</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#privacy">Privacy Policy</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                                <li><a href="#security">Security</a></li>
                                <li><a href="#data">Data Processing</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="footer-copyright">
                            © 2025 brew.ai. All rights reserved.
                        </div>
                        <div className="footer-social">
                            <a href="#twitter" aria-label="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#github" aria-label="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a href="#linkedin" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}