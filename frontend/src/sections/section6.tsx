import { Link } from 'react-router-dom'
import '../style/Home.css'
import '../style/section6.css'

export default function Section6 () {

    return (
        <div className="page-section sixth-section" id="sixth-section">
                <h2 className="six-title fading"> Your Plans, Perfectly
                    <span className="gradient-text"> Poured </span>
                </h2>
                <p className="six-desc fading">Start brew.ai today</p>
                <Link to="/login">
                    <button className="sign-up fading">Sign up</button>
                </Link>
            <img src="/images/pour-unscreen.gif" alt="Pour animation" className="pour-gif fading" />
        </div>
    );
}