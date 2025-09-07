import FadeInSection from "../components/FadeInSection"
import AnimatedCounter from "../components/AnimatedCounter"
import '../style/Home.css'
import '../style/section5.css'

export default function Section5() {
    return (
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
                                <AnimatedCounter end={2} suffix=" hours" className="stat-number" duration={500} />
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
                            AI can drive cars and write code-why can't it plan your day?
                            Brew takes the wheel in scheduling your plans, optimizing your time 
                            so you can focus on what matters.
                        </p>
                    </div>
                </div>
            </FadeInSection>
        </div>

    )
}