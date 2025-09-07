import { useState } from "react"
import { FaChevronDown } from "react-icons/fa"
import Navbar from "../components/Navbar"
import "../style/Faq.css"

export default function Faq() {
    const [active, setActive] = useState<string | null>(null);

    const toggle = (id: string) => {
        setActive(active === id ? null : id);
    };

    return (
        <div className="container">
            <Navbar />
            <h1 className="faq-title">Frequently Asked Questions</h1>
            <div className="accordion">
                <div className="accordion-item">
                    <button className="accordion-link" onClick={() => toggle("q1")}>
                        <h3>Why AI for scheduling?</h3>
                        <FaChevronDown className={`arrow ${active === "q1" ? "open" : ""}`} />
                    </button>
                    <div className={`answer ${active === "q1" ? "show" : ""}`}>
                        <p>No more excessive times spent planning exact logistics
                        and shuffling items around your calendar. Let AI handle the long parts.</p>
                    </div>
                    <hr />
                </div>

                <div className="accordion-item">
                    <button className="accordion-link" onClick={() => toggle("q2")}>
                        <h3>Who can use Brew?</h3>
                        <FaChevronDown className={`arrow ${active === "q2" ? "open" : ""}`} />
                    </button>
                    <div className={`answer ${active === "q2" ? "show" : ""}`}>
                        <p>Students, teachers, employees, businesses, freelancers, and 
                        anyone looking to make their scheduling completely hassle-free.</p>
                    </div>
                    <hr />
                </div>

                <div className="accordion-item">
                    <button className="accordion-link" onClick={() => toggle("q3")}>
                        <h3>Is Brew free?</h3>
                        <FaChevronDown className={`arrow ${active === "q3" ? "open" : ""}`} />
                    </button>
                    <div className={`answer ${active === "q3" ? "show" : ""}`}>
                        <p>Yes, currently it is free.</p>
                    </div>
                    <hr />
                </div>

            </div>
        </div>
    );
}
