import { Link } from 'react-router-dom'
import FadeInSection from "../components/FadeInSection"
import '../style/Home.css'
import '../style/section6.css'

export default function Section6 () {
    return (
        <div className="page-section sixth-section" id="sixth-section">
            <FadeInSection>
                <h2 className="six-title"> Your Plans, Perfectly
                    <span className="gradient-text"> Poured </span>
                </h2>
                <p className="six-desc">Start brew.ai today</p>
            </FadeInSection>
            <FadeInSection>
                <Link to="/login">
                    <button className="sign-up">Sign up</button>
                </Link>
            </FadeInSection>
            <img src="/images/pour-unscreen.gif" alt="Pour animation" className="pour-gif" />
        </div>
    );
}