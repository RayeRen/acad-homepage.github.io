const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "deep-blue",
  "density": "regular",
  "theme": "light",
  "showStats": true
}/*EDITMODE-END*/;

const ACCENTS = {
  "deep-blue":   { c: "oklch(0.45 0.12 250)", soft: "oklch(0.45 0.12 250 / 0.10)", dark: "oklch(0.78 0.12 250)", softDark: "oklch(0.78 0.12 250 / 0.16)" },
  "forest":      { c: "oklch(0.42 0.10 155)", soft: "oklch(0.42 0.10 155 / 0.10)", dark: "oklch(0.78 0.12 155)", softDark: "oklch(0.78 0.12 155 / 0.16)" },
  "rust":        { c: "oklch(0.55 0.14 40)",  soft: "oklch(0.55 0.14 40 / 0.10)",  dark: "oklch(0.78 0.14 40)",  softDark: "oklch(0.78 0.14 40 / 0.16)"  },
  "ink":         { c: "oklch(0.30 0.02 280)", soft: "oklch(0.30 0.02 280 / 0.10)", dark: "oklch(0.85 0.02 280)", softDark: "oklch(0.85 0.02 280 / 0.16)" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [showAllNews, setShowAllNews] = useState(false);
  const [showAllWork, setShowAllWork] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("May 13, 2026");
  useEffect(() => {
    fetch("build-meta.json")
      .then(r => r.json())
      .then(d => { if (d.lastUpdated) setLastUpdated(d.lastUpdated); })
      .catch(() => {});
  }, []);
  const theme = t.theme;

  // Apply theme + density on <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = t.density;
  }, [theme, t.density]);

  // Apply accent palette via CSS vars
  useEffect(() => {
    const a = ACCENTS[t.accent] || ACCENTS["deep-blue"];
    const root = document.documentElement;
    root.style.setProperty("--accent", theme === "dark" ? a.dark : a.c);
    root.style.setProperty("--accent-soft", theme === "dark" ? a.softDark : a.soft);
  }, [t.accent, theme]);

  const toggleTheme = () => setTweak("theme", theme === "dark" ? "light" : "dark");

  return (
    <div className="page">
      <Sidebar />
      <main className="main">
        <TopNav theme={theme} onToggleTheme={toggleTheme} />

        {/* About */}
        <section id="about" className="section" data-screen-label="about">
          <SectionHead title="About" />
          <p className="about-lede">{SITE.lede}</p>
          <div className="about-body">
            {SITE.bioParas.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {t.showStats && (
            <div className="stats">
              {STATS.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat-value">
                    <AnimatedNumber value={s.value} />
                    {s.unit && <span className="unit">{s.unit}</span>}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* News */}
        <section id="news" className="section" data-screen-label="news">
          <SectionHead title="News" />
          <div className="news-timeline">
            {(showAllNews ? NEWS : NEWS.slice(0, 3)).map((n, i) => (
              <div className="news-tl-item" data-tag={n.tag} key={i}>
                <div className="news-tl-dot" />
                <div className="news-tl-top">
                  <span className="news-date">{n.date}</span>
                  <span className={`news-tag news-tag--${n.tag}`}>{n.tag}</span>
                </div>
                <div className="news-body">{n.body}</div>
              </div>
            ))}
          </div>
          {NEWS.length > 3 && (
            <button className="news-more" onClick={() => setShowAllNews(v => !v)}>
              {showAllNews ? "Show less" : `Show all ${NEWS.length} →`}
            </button>
          )}
        </section>

        {/* Publications */}
        <section id="pubs" className="section" data-screen-label="publications">
          <SectionHead title="Publications" sub={`${PUBS.length} papers · ${PUBS.reduce((a,p)=>a+p.cites,0)} citations`} />
          {PUBS.map((p, i) => <PubCard p={p} key={i} />)}
        </section>


        {/* Education */}
        <section id="edu" className="section" data-screen-label="education">
          <SectionHead title="Education" />
          {EDU.map((h, i) => (
            <div className="row" key={i}>
              <span className="row-date">{h.date}</span>
              <div>
                <h3 className="row-title">{h.title}{i === 0 && <span className="row-badge">Current</span>}</h3>
                <div className="row-place">{h.place}</div>
                <div className="row-desc">{h.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Work */}
        <section id="work" className="section" data-screen-label="experience">
          <SectionHead title="Experience" />
          {(showAllWork ? WORK : WORK.slice(0, 3)).map((h, i) => (
            <div className="row" key={i}>
              <span className="row-date">{h.date}</span>
              <div>
                <h3 className="row-title">{h.title}</h3>
                <div className="row-place">{h.place}</div>
                <div className="row-desc">{h.desc}</div>
              </div>
            </div>
          ))}
          {WORK.length > 3 && (
            <button className="news-more" onClick={() => setShowAllWork(v => !v)}>
              {showAllWork ? "Show less" : `Show all ${WORK.length} →`}
            </button>
          )}
        </section>

        <footer className="foot">
          <div>
            © {new Date().getFullYear()} · Dongmei Gao · last updated {lastUpdated}
          </div>
        </footer>
      </main>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
