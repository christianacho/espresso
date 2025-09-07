import '../style/section4.css'
import '../style/Home.css'

export default function Section4() {
    return (
        <div className="page-section fourth-section" id="fourth-section">
                <div className="features-container ">
                    <div className="feature-card">
                        <h3 className="feature-title fading">Focuses on What Matters</h3>
                        <p className="feature-description fading">
                            Brew ranks your tasks so you tackle the most important ones first
                        </p>
                        <div className="feature-visual fading">
                            <div className="motion-placeholder fading">motion design</div>
                        </div>
                    </div>

                    <div className="feature-card">
                        <h3 className="feature-title fading">Captures<br /> Everything</h3>
                        <p className="feature-description fading">
                            Drop tasks, ideas, and errands in one place and watch Brew organize them
                        </p>
                        <div className="feature-visual fading">
                            <div className="motion-placeholder fading">motion design</div>
                        </div>
                    </div>

                    <div className="feature-card">
                        <h3 className="feature-title fading">Adjusts on <br />Feedback</h3>
                        <p className="feature-description fading">
                            Brew reshuffles your schedule when tasks take longer or you fall behind
                        </p>
                        <div className="feature-visual fading">
                            <div className="motion-placeholder">motion design</div>
                        </div>
                    </div>
                </div>
        </div>
    );
}