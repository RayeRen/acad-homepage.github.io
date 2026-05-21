// Site data — separated so it's easy to edit.

const SITE = {
  name: "Dongmei Gao",
  role: "PhD Student",
  affiliation: "Aalto University",
  location: "Espoo, Finland",
  lede: (
    <>
      I research the <em>developer experience in software engineering</em> — how developers
      think, struggle, and collaborate when working with low-code tools.
    </>
  ),
  bioParas: [
    "I'm a PhD student at Aalto University, working at the intersection of human–computer interaction and software engineering. Before returning to academia, I spent three years as a frontend developer — that hands-on experience is what first pulled me toward studying human-computer interaction as my master's program.",
    "My master's thesis examined the developer experience of low-code platforms. That work shaped the direction I continue to follow in my PhD: understanding when low-code helps, when it gets in the way, and what it means for the people who build with it.",
  ],
  contact: {
    email: "dongmei.gao@aalto.fi",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/dongmei-gao/" },
      { label: "GitHub",   href: "https://github.com/gdongmei" },
      { label: "Scholar",  href: "https://scholar.google.com/citations?user=2vPNs3EAAAAJ" },
      { label: "ORCID",    href: "https://orcid.org/0009-0000-7332-8208" },
    ],
  },
};

const STATS = [
  { value: "3",  unit: "yrs",     label: "Industry" },
  { value: "4",  unit: "yrs",     label: "Research" },
  { value: "3",  unit: "papers",  label: "Published" },
  // { value: "11", unit: "",        label: "Citations" }
];

const NEWS = [
  { date: "Apr 2026", tag: "publication", body: <>The paper <a href="https://www.sciencedirect.com/science/article/pii/S0164121226001263">a systematic literature review on low-code development</a> was accepted by the <em>Journal of Systems and Software</em>.</> },
  { date: "Dec 2025", tag: "talk",        body: <>Presented my paper at <a href="https://conf.researchr.org/home/profes-2025">PROFES 2025</a> in Salerno, Italy.</> },
  { date: "Aug 2024", tag: "project",     body: <>Completed the summer school course <b>Data Visualization</b> at Aalto. <a href="https://github.com/gdongmei/gdongmei.github.io/blob/main/images/visualization.png?raw=true">See the work →</a></> },
  { date: "Feb 2024", tag: "publication", body: <>The paper on my master's thesis was <a href="https://www.e-informatyka.pl/index.php/einformatica/volumes/volume-2024/issue-1/article-5/">published</a>.</> },
  { date: "Nov 2022", tag: "milestone",   body: <>Started my PhD at Aalto University.</> },
];

const PUBS = [
  {
    year: 2026,
    venue: "Journal of Systems and Software",
    type: "Journal",
    title: "What does current research say about the viability of low-code development? A systematic literature review",
    authors: ["Dongmei Gao", "Fabian Fagerholm", "Vilma Toivanen"],
    href: "https://www.sciencedirect.com/science/article/pii/S0164121226001263",
    img: "images/slr.jpg",
    bullets: [
      "A comprehensive synthesis of LCD research, providing insights into the viability of LCD.",
      "A context- and evidence-based analysis of LCD adoption, highlighting key benefits, challenges, and success factors.",
      "Insights into social and organizational dynamics, including culture, collaboration, and stakeholder engagement in LCD adoption.",
      "Identification of research gaps, guiding future studies toward underexplored areas in LCD.",
    ],
    cites: 0,
  },
  {
    year: 2025,
    venue: "PROFES 2025",
    type: "Conference",
    title: "An Investigation of Low-Code Development Adoption in a Finnish IT Consulting Firm",
    authors: ["Dongmei Gao", "Fabian Fagerholm"],
    href: "https://link.springer.com/chapter/10.1007/978-3-032-12089-2_11",
    img: "images/interview study.png",
    bullets: [
      "Provides insights into the motivations and challenges of adopting LCDPs in consulting firms, with a particular focus on the Finnish market.",
      "Supports researchers and platform vendors in refining their focus on the broader adoption and untapped opportunities of LCD.",
      "Develops evidence-based points regarding LCD for client companies when considering more efficient and cost-effective solutions.",
    ],
    cites: 0,
  },
  {
    year: 2024,
    venue: "e-Informatica Software Engineering Journal",
    type: "Journal",
    title: "Measuring End-user Developers' Episodic Experience of a Low-code Development Platform",
    authors: ["Dongmei Gao", "Fabian Fagerholm"],
    href: "https://www.e-informatyka.pl/index.php/einformatica/volumes/volume-2024/issue-1/article-5/",
    img: "images/500x300.png",
    bullets: [
      "Understands end-user developers' episodic experience when using a low-code platform.",
      "Provides guidance on how episodic experience can be measured.",
      "Illustrates the design of questionnaire-based experience assessment in the context of development.",
      "Identifies the importance of separating personal experience from assessment of tasks and tools.",
    ],
    cites: 7,
  },
];

const HONORS = [
  { date: "2025", title: "Aalto Doc Incentive Scholarship SCI", place: "Aalto University", desc: "" },
  { date: "2022", title: "Aalto Dean's Scholarship",             place: "Aalto University", desc: "" },
];

const EDU = [
  { date: "2023.02 — present", title: "PhD, Software and Service Engineering",     place: "Aalto University · Espoo, FI",               desc: "Advisor: Fabian Fagerholm. Research focus: developer experience, low-code development, HCI methods in SE." },
  { date: "2020.08 — 2022.09",    title: "MSc, Human–Computer Interaction",              place: "Aalto University · Espoo, FI",               desc: "Minor in USchool (user-centered design). Thesis on the developer experience of low-code development." },
  { date: "2013.08 — 2017.06",    title: "BEng, Electronic and Information Engineering", place: "South China University of Technology · China", desc: "Foundation in computer science." },
];

const WORK = [
  { date: "2024.10 — 2024.12, 2025.02 — 2025.05", title: "Teaching Assistant", place: "Aalto University · Finland", desc: "Assist professors to give lectures and grade assignments." },
  // { date: "2022.08 — 2022.10", title: "UX/UI Designer",              place: "Greencarlane · Remote",                       desc: "Internship focused on user experience and interface design." },
  { date: "2022.02 — 2022.07", title: "Research Assistant",          place: "Aalto University · Finland",                  desc: "Contract research doing my master's thesis at Aalto University." },
  { date: "2021.06 — 2021.09", title: "Product Experience Designer", place: "Tencent · China",                              desc: "Internship in product experience design." },
  { date: "2017.07 — 2020.06", title: "Frontend Developer",          place: "GaoDing Xiamen Technology Co., Ltd. · China", desc: "Three years building production web apps as a full-time frontend developer." },
];

Object.assign(window, { SITE, STATS, NEWS, PUBS, HONORS, EDU, WORK });
