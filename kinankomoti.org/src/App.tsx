import { motion } from "framer-motion";
import icon from "./icon/kinankomoti.jpg";
import WorkList from "./work";
import Background from "./background";
import ScrollIndicator from "./ScrollIndicator";
import "./App.css";

function AboutMe() {
  const socialLinks = [
    { label: "X", href: "https://x.com/Kinakomoti2357" },
    { label: "GitHub", href: "https://github.com/kinakomoti-321" },
  ];

  return (
    <div className="profile-wrap">
      <div style={{ textAlign: "left" }}>
        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
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
            <p>Graphics Engineer</p>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "12px" }}>
          <div>
            <h2>skill</h2>
            <p>C++ / C / C# / GLSL / HLSL / Slang / Rust</p>
          </div>
          <div>
            <h2>Interests</h2>
            <p> - Computer Graphcis</p>
            <p> - Physically Based Rendering </p>
            <p> - Geometry </p>
          </div>
        </div>

        <h2 style={{ marginTop: "20px" }}>links</h2>
        <div className="social-grid">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="social-card"
            >
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
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

  return (
    <>
      <Background />
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
        <section id="profile" className="section section-center">
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
