import React, { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const name = "brew.ai";
  const hook = "brew structure, sip freedom";
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const cursorActive = true;
  const [showHook, setShowHook] = useState(false);

  useEffect(() => {
    if (displayed.length < name.length) {
      const timeout = setTimeout(() => {
        setDisplayed(name.slice(0, displayed.length + 1));
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      const hookTimeout = setTimeout(() => setShowHook(true), 400);
      return () => clearTimeout(hookTimeout);
    }
  }, [displayed, name]);

  useEffect(() => {
    if (!showCursor) return;
    const cursorInterval = setInterval(() => {
      setShowCursor((c) => !c);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [cursorActive]);

  return (
  <>
    <div className="home-container">
      <h1 className="home-title">
        {displayed}
        <span
          className="home-cursor"
          style={{ opacity: showCursor ? 1 : 0 }}
        >|</span>
      </h1>
      <h2 className={`home-hook${showHook ? " visible" : ""}`}>
        {hook}
      </h2>
    </div>
    <div className="home-section">
      <h3>Welcome to the next section!</h3>
      <p>This area has a different background color.</p>
    </div>
  </>
);
}