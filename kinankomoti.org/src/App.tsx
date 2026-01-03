import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import icon from "./icon/kinankomoti.jpg";
import WorkList from "./work";
import Background from "./background";
import ScrollIndicator from "./ScrollIndicator";
import "./App.css";

function AboutMe() {
  const socialLinks = [
    { label: "X", href: "https://x.com/Kinakomoti2357" },
    { label: "GitHub", href: "https://github.com/kinankomoti-321" },
  ];

  return (
    <div className="profile-wrap">
      <div style={{ textAlign: "left" }}>
        <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
          <div>
            <img
              src={icon}
              alt="kinankomoti"
              width={128 * 1.5}
              height={128 * 1.5}
              style={{ borderRadius: "8px", marginTop: "12px" }}
            />
          </div>
          <div style={{ textAlign: "left" }}>
            <h1>kinankomoti</h1>
            <h3>きなこもち</h3>

            <br></br>
            <p>PBRが好きです</p>
          </div>
        </div>

        <div style={{ margin: "10px", marginTop: "40px" }}>
          <h2>skill</h2>
          <div style={{ margin: "15px" }}>
            <p> C++ / C / C# / Rust / GLSL / HLSL / Slang </p>
            <p> Blender / Houdini / Substance Painter</p>
          </div>
        </div>

        <div style={{ margin: "10px", marginTop: "40px" }}>
          <h2>Interests</h2>
          <div style={{ margin: "15px" }}>
            <p> - Computer Graphcis</p>
            <p> - Physically Based Rendering</p>
            <p> - Raytracing</p>
            <p> - Geometry </p>
            <p> - Optics </p>
            <p> - Reflection </p>
          </div>
        </div>

        <div style={{ margin: "10px", marginTop: "40px" }}>
          <h2>Activity</h2>
          <div style={{ margin: "15px" }}>
            <p> - Internship: Polyphony Digital 2023/2</p>
            <p> - working in tokyo 2024/4 ~</p>
          </div>
        </div>

        <div style={{ margin: "10px", marginTop: "40px" }}>
          <h2>links</h2>
          <div style={{ margin: "15px" }}>
            <p>- X</p>
            <p>- Blog</p>
            <p>- Github</p>
          </div>
        </div>
      </div>
    </div >
  );
}

function Home() {
  return (
    <motion.div
      key="home"
      className="home-hero"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="home-title">kinankomoti.org</h1>
    </motion.div>
  );
}

function Work() {
  return (
    <motion.div
      key="work"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4 }}
    >
      <h1>Work</h1>
      <WorkList />
    </motion.div>
  );
}

function App() {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "profile", label: "Profile" },
    { id: "work", label: "Work" },
  ];
  const profileRef = useRef<HTMLElement | null>(null);
  const [dimOpacity, setDimOpacity] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const updateDim = () => {
      rafId = 0;
      const profile = profileRef.current;
      if (!profile) return;
      const profileTop = profile.getBoundingClientRect().top + window.scrollY;
      const progress = Math.min(1, Math.max(0, window.scrollY / profileTop));
      setDimOpacity(progress * 0.8);
    };
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateDim);
    };

    updateDim();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateDim);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDim);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <Background />
      <div className="background-dim" style={{ opacity: dimOpacity }} aria-hidden="true" />
      <ScrollIndicator />
      <header className="header">
        <nav className="header-menu">
          {tabs.map((tab) => (
            <a key={tab.id} className="tab-item" href={`#${tab.id}`}>
              {tab.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="content">
        <section id="home" className="section">
          <Home />
        </section>
        <section id="profile" className="section section-center" ref={profileRef}>
          <AboutMe />
        </section>
        <section id="work" className="section">
          <Work />
        </section>
      </main>
    </>
  );
}

export default App;
