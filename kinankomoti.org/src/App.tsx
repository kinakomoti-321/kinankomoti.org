import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import icon from "./icon/kinankomoti.jpg";
import WorkList from "./work";
import "./App.css";

function AboutMe() {
  return (
    <div>
      <motion.div
        key="about"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: "left" }}>
          <h1>kinankomoti</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
            <img
              src={icon}
              alt="kinankomoti"
              width={128}
              height={128}
              style={{ borderRadius: "8px", marginTop: "12px" }}
            />
            <div style={{ textAlign: "left" }}>
              <p>Physically Based Renderingが好き</p>
              <p>某所でグラフィックスエンジニアをさせて頂いてます</p>
            </div>
          </div>
          <h2>skill</h2>
          <p>C++ / C / C# / GLSL / HLSL / Slang / Rust</p>
          <p>Physics, Optics, Computer Graphics</p>
        </div>

      </motion.div>
    </div>
  )
}

function Home() {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4 }}
    >
      <h1>kinankomoti.org</h1>
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
    { id: "about", label: "About Me" },
    { id: "work", label: "Work" },
  ];

  const [activeTab, setActiveTab] = useState("home");

  const content = {
    home: Home(),
    about: AboutMe(),
    work: Work(),
  };

  return (
    <>
      <header className="header">
        <nav className="header-nemu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        <AnimatePresence mode="wait">
          {content[activeTab]}
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;
