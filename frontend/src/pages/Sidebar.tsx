import { useState, useEffect } from "react";
import '../style/Sidebar.css';

export default function SidebarDots() {
  const sections = ["first-section", "second-section", "third-section", "fourth-section", "fifth-section", "sixth-section"];
  const [activeSection, setActiveSection] = useState<string>("first-section");

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0];
      for (let id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="sidebar">
      {sections.map((id) => (
        <a key={id} href={`#${id}`}>
          <div className={`dot ${activeSection === id ? "active" : ""}`} />
        </a>
      ))}
    </div>
  );
}
