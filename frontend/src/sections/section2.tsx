import FadeInSection from "../components/FadeInSection"
import '../style/section2.css'
import '../style/Home.css'

export default function Section2() {
    return (
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
    );
}