import { useEffect, useState } from 'react'
import '../style/Home.css'
import '../style/section3.css'

export default function Section3() {
    const [activeWord, setActiveWord] = useState<string | null>(null);
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
    );
}