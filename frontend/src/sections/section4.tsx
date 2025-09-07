import FadeInSection from "../components/FadeInSection";
import '../style/section4.css';
import '../style/Home.css';

export default function Section4() {
    return (
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
    );
}