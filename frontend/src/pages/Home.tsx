import React, { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const name = "brew.ai";
  const hook = (
    <>
      brew structure, sip <span style={{ color: '#A67C52' }}>freedom</span>
    </>
  );
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const cursorActive = true;
  const [showHook, setShowHook] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    if (displayed.length < name.length) {
      const timeout = setTimeout(() => {
        setDisplayed(name.slice(0, displayed.length + 1));
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      const hookTimeout = setTimeout(() => setShowHook(true), 400);
      const subtextTimeout = setTimeout(() => setShowSubtext(true), 1000);
      return () => {
        clearTimeout(hookTimeout);
        clearTimeout(subtextTimeout);
      };
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
    <div className="page-wrapper">
      <div className="page-section home-container">
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
        <p className={`home-subtext${showSubtext ? " visible" : ""}`}>
          Brew uses AI to keep your schedule flowing, even when it overflows
        </p>
      </div>
      <div className="page-section second-section">
        <h2>Welcome to brew.ai</h2>
        <p>Start your journey here</p>
      </div>
    </div>
  );
}