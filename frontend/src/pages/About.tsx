
import Navbar from '../components/Navbar'
import '../style/About.css'

export default function About() {
    return (
        <div className="about">
            <Navbar />
            <h1 className="about-title"> About Us </h1> 

            <h1 className="about-mission"> Our Mission </h1>
            <p className="about-text">
                We built Brew to solve one of our most common frustrations —-
                spending too much time dragging, dropping, and reshuffling calendar
                events. 
            </p>

        </div>
        
    );
}