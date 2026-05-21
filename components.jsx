// Reusable UI bits for the personal site.

const { useEffect, useRef, useState } = React;

// ---------- Animated number ----------
function AnimatedNumber({ value, duration = 900 }) {
  const [n, setN] = useState(0);
  const startRef = useRef(null);
  const target = parseInt(value, 10);
  const isNum = !isNaN(target);
  useEffect(() => {
    if (!isNum) return;
    let raf;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, isNum]);
  return <>{isNum ? n : value}</>;
}

// ---------- Sidebar ----------
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="portrait">
        <img src="images/android-chrome-512x512.png" alt="Dongmei Gao" />
      </div>

      <h1 className="name">Dongmei <em>Gao</em></h1>
      <p className="name-zh">In Chinese, 高冬梅</p>

      <div className="role">
        <div>PhD researcher · HCI × Software Engineering</div>
        <div className="role-line">
          <span className="pulse"></span>
          <span>Available for collaboration · 2026</span>
        </div>
      </div>

      <p className="bio"></p>

      <div className="meta">
        <div className="meta-row">
          <span className="meta-key">Affiliation</span>
          <span className="meta-val">Aalto University</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">Location</span>
          <span className="meta-val">Espoo, Finland</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">Email</span>
          <span className="meta-val"><a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a></span>
        </div>

      </div>

      <div className="socials">
        {SITE.contact.links.map((l) => (
          <a key={l.label} href={l.href}>{l.label}</a>
        ))}
      </div>

      <div className="sidebar-pages">
        <a href="interests.html">Interests →</a>
      </div>
    </aside>
  );
}

// ---------- Top nav with scroll-spy ----------
const NAV = [
  { id: "about",   label: "About" },
  { id: "news",    label: "News",         count: NEWS.length },
  { id: "pubs",    label: "Publications", count: PUBS.length },
  { id: "edu",     label: "Education",    count: EDU.length },
  { id: "work",    label: "Work Experience" },
];

function TopNav({ theme, onToggleTheme }) {
  const [active, setActive] = useState("about");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={active === n.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(n.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {n.label}
            {n.count != null && <span className="count">/{String(n.count).padStart(2, "0")}</span>}
          </a>
        ))}
      </div>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        <span className="glyph"></span>
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
}

// ---------- Section header ----------
function SectionHead({ num, title, sub }) {
  return (
    <header className="section-head">
      {num && <span className="section-num">{num}</span>}
      <h2 className="section-title">{title}</h2>
      {sub && <span className="section-sub">{sub}</span>}
    </header>
  );
}


function PubCard({ p }) {
  return (
    <article className="pub">
      <div className="pub-left">
        <div className="pub-figure">
          <img src={p.img} alt={p.title} />
        </div>
        <a className="pub-read" href={p.href}>Read paper</a>
      </div>
      <div>
        <div className="pub-meta">
          <span className="pub-venue">{p.venue}</span>
          <span className="pub-divider">·</span>
          <span>{p.year}</span>
          <span className="pub-divider">·</span>
          <span>{p.type}</span>
          {p.cites > 0 && (
            <span className="cite-pill" style={{ marginLeft: "auto" }}>
              <b>{p.cites}</b> citations
            </span>
          )}
        </div>
        <h3 className="pub-title"><a href={p.href}>{p.title}</a></h3>
        <p className="pub-authors">
          {p.authors.map((a, i) => (
            <span key={a} className={a === "Dongmei Gao" ? "me" : ""}>
              {a}{i < p.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
        <ul className="pub-bullets">
          {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    </article>
  );
}

function useTweaks(defaults) {
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("site-tweaks") || "{}");
      return { ...defaults, ...saved };
    } catch {
      return { ...defaults };
    }
  });
  function setTweak(key, value) {
    setState(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem("site-tweaks", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  return [state, setTweak];
}

Object.assign(window, {
  AnimatedNumber, Sidebar, TopNav, SectionHead, PubCard, NAV, useTweaks,
});
