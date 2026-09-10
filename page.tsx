'use client';

import { useEffect, useState } from 'react';

type Language = 'en' | 'zh';

const copy = {
  en: {
    nav: { about: 'Profile', work: 'Research', publications: 'Publications', scholar: 'Scholar' },
    role: 'PhD Candidate · Year 5',
    school: 'School of Data Science · CUHK-Shenzhen',
    eyebrow: 'Scientific machine learning / AI for Science',
    intro:
      'I develop numerical learning methods for PDE-governed systems—making physics-informed neural networks more accurate, scalable, and easier to train.',
    explore: 'Explore research',
    profile: 'Google Scholar',
    nowLabel: 'Current signal',
    nowTitle: 'Complex physics-informed neural network',
    nowMeta: 'Journal of Computational Physics · 2026',
    axesLabel: 'Research coordinates',
    axes: ['Scientific ML', 'Physics-informed learning', 'PDE solvers'],
    featuredLabel: 'Selected work / 01',
    featuredTitle: 'A single Cauchy layer for complex, high-dimensional PDEs.',
    featuredBody:
      'compleX-PINN introduces a learnable activation inspired by the Cauchy integral formula, delivering high accuracy with a compact architecture.',
    paper: 'Read paper',
    code: 'View code',
    metricsLabel: 'Scholar snapshot · Sep 2026',
    metricCitations: 'citations',
    metricH: 'h-index',
    metricWorks: 'listed works',
    publicationsLabel: 'Publication field / all 07',
    publicationsTitle: 'Architectures, optimization, and generative scientific models.',
    publicationsIntro:
      'A compact record of peer-reviewed articles, workshop work, and current preprints. Citation counts are a September 2026 snapshot; Google Scholar remains the live source.',
    citations: 'citations',
    open: 'Open',
    aboutLabel: 'Position / trajectory',
    aboutTitle: 'Building practical learning systems for hard scientific problems.',
    aboutBody:
      'My work sits between numerical analysis and machine learning. I study how structure from differential equations can guide models—and how optimization can make those models reliable on difficult, high-dimensional systems.',
    current: 'Current',
    degree: 'PhD in Data Science',
    period: '2022 — Present',
    focusLabel: 'Working focus',
    focus: ['PINN architecture', 'Adaptive optimization', 'High-dimensional PDEs', 'Physics-constrained generation'],
    contactLabel: 'Open channels',
    contactTitle: 'Ideas, questions, collaborations?',
    contactBody:
      'I am always interested in thoughtful conversations around scientific machine learning, numerical methods, and AI for Science.',
    email: 'Email',
    github: 'GitHub',
    orcid: 'ORCID',
    sourceNote: 'Publication record verified against Google Scholar.',
  },
  zh: {
    nav: { about: '简介', work: '研究', publications: '论文', scholar: '学术主页' },
    role: '博士研究生 · 五年级',
    school: '数据科学学院 · 香港中文大学（深圳）',
    eyebrow: '科学机器学习 / AI for Science',
    intro:
      '我的研究聚焦由偏微分方程驱动的数值学习方法，致力于提升物理信息神经网络的精度、可扩展性与训练效率。',
    explore: '查看研究',
    profile: '谷歌学术',
    nowLabel: '近期代表工作',
    nowTitle: '复数物理信息神经网络',
    nowMeta: 'Journal of Computational Physics · 2026',
    axesLabel: '研究坐标',
    axes: ['科学机器学习', '物理信息学习', '偏微分方程求解'],
    featuredLabel: '代表工作 / 01',
    featuredTitle: '以单个 Cauchy 层求解复杂、高维偏微分方程。',
    featuredBody:
      'compleX-PINN 引入受 Cauchy 积分公式启发的可学习激活函数，以紧凑架构实现高精度数值求解。',
    paper: '阅读论文',
    code: '查看代码',
    metricsLabel: '学术指标快照 · 2026 年 9 月',
    metricCitations: '引用',
    metricH: 'h 指数',
    metricWorks: '收录成果',
    publicationsLabel: '论文坐标 / 共 07 项',
    publicationsTitle: '从模型架构、优化方法到生成式科学计算。',
    publicationsIntro:
      '这里汇总已发表论文、会议研讨会成果与近期预印本。引用次数为 2026 年 9 月快照，实时数据请以谷歌学术为准。',
    citations: '次引用',
    open: '打开',
    aboutLabel: '学术阶段 / 研究轨迹',
    aboutTitle: '为复杂科学问题构建真正可用的学习系统。',
    aboutBody:
      '我的工作位于数值分析与机器学习的交叉点：一方面研究如何用微分方程的结构约束模型，另一方面探索如何通过优化方法，使其在高维和高难度系统中更加可靠。',
    current: '目前',
    degree: '数据科学博士',
    period: '2022 — 至今',
    focusLabel: '研究重点',
    focus: ['PINN 模型架构', '自适应优化', '高维偏微分方程', '物理约束生成模型'],
    contactLabel: '联系与合作',
    contactTitle: '有想法、问题，或者合作方向？',
    contactBody:
      '欢迎围绕科学机器学习、数值方法和 AI for Science 展开交流。',
    email: '邮箱',
    github: 'GitHub',
    orcid: 'ORCID',
    sourceNote: '论文记录已根据谷歌学术核对。',
  },
};

const publications = [
  {
    year: '2026',
    type: 'JOURNAL',
    title: 'Convolution-weighting method for the physics-informed neural network: A primal-dual optimization perspective',
    titleZh: '卷积加权物理信息神经网络：原始—对偶优化视角',
    authors: 'Chenhao Si, Ming Yan',
    venue: 'Journal of Computational Physics 555, 114773',
    citations: 11,
    url: 'https://doi.org/10.1016/j.jcp.2026.114773',
  },
  {
    year: '2026',
    type: 'JOURNAL',
    title: 'Complex physics-informed neural network',
    titleZh: '复数物理信息神经网络',
    authors: 'Chenhao Si, Ming Yan, Xin Li, Zhihong Xia',
    venue: 'Journal of Computational Physics 553, 114713',
    citations: 12,
    url: 'https://doi.org/10.1016/j.jcp.2026.114713',
    code: 'https://github.com/S-Chenhao/compleX-PINN',
  },
  {
    year: '2026',
    type: 'PREPRINT',
    title: 'From Non-Convex Self-Concordant Regularization to Scalable Quasi-Newton Training of PINNs',
    titleZh: '从非凸自协调正则化到 PINN 的可扩展拟牛顿训练',
    authors: 'Chenhao Si, Kang An, Shiqian Ma, Ming Yan',
    venue: 'arXiv:2608.04206',
    citations: 1,
    url: 'https://arxiv.org/abs/2608.04206',
  },
  {
    year: '2026',
    type: 'PREPRINT',
    title: 'Lightweight Geometric Adaptation for Training Physics-Informed Neural Networks',
    titleZh: '用于训练物理信息神经网络的轻量级几何自适应',
    authors: 'Kang An, Chenhao Si, Shiqian Ma, Ming Yan',
    venue: 'arXiv:2604.15392',
    citations: 1,
    url: 'https://arxiv.org/abs/2604.15392',
  },
  {
    year: '2025',
    type: 'JOURNAL',
    title: 'Initialization-enhanced physics-informed neural network with domain decomposition (IDPINN)',
    titleZh: '基于区域分解的初始化增强型物理信息神经网络（IDPINN）',
    authors: 'Chenhao Si, Ming Yan',
    venue: 'Journal of Computational Physics 530, 113914',
    citations: 30,
    url: 'https://doi.org/10.1016/j.jcp.2025.113914',
  },
  {
    year: '2025',
    type: 'WORKSHOP',
    title: 'APOD: Adaptive PDE-observation diffusion for physics-constrained sampling',
    titleZh: 'APOD：面向物理约束采样的自适应 PDE—观测扩散',
    authors: 'Ruichen Xu, Haochun Wang, Georgios Kementzidis, Chenhao Si, Yuefan Deng',
    venue: 'ICML Workshop on Assessing World Models',
    citations: 3,
    url: 'https://openreview.net/forum?id=Z1J7LJGDxH',
  },
  {
    year: '2025',
    type: 'PREPRINT',
    title: 'AutoBalance: An automatic balancing framework for training physics-informed neural networks',
    titleZh: 'AutoBalance：物理信息神经网络训练的自动平衡框架',
    authors: 'Kang An, Chenhao Si, Ming Yan, Shiqian Ma',
    venue: 'arXiv:2510.06684',
    citations: 1,
    url: 'https://arxiv.org/abs/2510.06684',
  },
];

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem('chenhao-language');
    const preferred: Language =
      saved === 'zh' || saved === 'en'
        ? saved
        : window.navigator.language.toLowerCase().startsWith('zh')
          ? 'zh'
          : 'en';
    setLanguage(preferred);
    document.documentElement.lang = preferred === 'zh' ? 'zh-CN' : 'en';
  }, []);

  const chooseLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem('chenhao-language', next);
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
  };

  return (
    <main id="top" className="site-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Chenhao Si home">
          <span className="wordmark-mark">CS</span>
          <span className="wordmark-copy">Scientific ML</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#profile">{t.nav.about}</a>
          <a href="#research">{t.nav.work}</a>
          <a href="#publications">{t.nav.publications}</a>
          <a
            href="https://scholar.google.com/citations?user=Vqf7dwEAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
          >
            {t.nav.scholar}<span aria-hidden="true"> ↗</span>
          </a>
        </nav>

        <div className="language-switch" aria-label="Language switcher">
          <button
            type="button"
            className={language === 'en' ? 'is-active' : ''}
            aria-pressed={language === 'en'}
            onClick={() => chooseLanguage('en')}
          >
            EN
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            className={language === 'zh' ? 'is-active' : ''}
            aria-pressed={language === 'zh'}
            onClick={() => chooseLanguage('zh')}
          >
            中文
          </button>
        </div>
      </header>

      <section id="profile" className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit-node node-one" />
          <span className="orbit-node node-two" />
          <span className="orbit-formula">∂u/∂t + N[u] = 0</span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow"><span>01</span>{t.eyebrow}</p>
          <h1 id="hero-title">
            Chenhao
            <span>Si</span>
          </h1>
          <p className="role-line">{t.role}</p>
          <p className="school-line">{t.school}</p>
          <p className="intro">{t.intro}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#research">
              {t.explore}<span aria-hidden="true">↓</span>
            </a>
            <a
              className="text-action"
              href="https://scholar.google.com/citations?user=Vqf7dwEAAAAJ&hl=en"
              target="_blank"
              rel="noreferrer"
            >
              {t.profile}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <aside className="signal-card" aria-label={t.nowLabel}>
          <div className="signal-index">2026—01</div>
          <div className="signal-plot" aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <p>{t.nowLabel}</p>
          <h2>{t.nowTitle}</h2>
          <span>{t.nowMeta}</span>
        </aside>

        <div className="research-axis">
          <p>{t.axesLabel}</p>
          <ol>
            {t.axes.map((axis, index) => (
              <li key={axis}><span>0{index + 1}</span>{axis}</li>
            ))}
          </ol>
        </div>
      </section>

      <section id="research" className="featured-work" aria-labelledby="featured-title">
        <div className="section-number" aria-hidden="true">02</div>
        <div className="featured-copy">
          <p className="eyebrow"><span>2026</span>{t.featuredLabel}</p>
          <h2 id="featured-title">{t.featuredTitle}</h2>
          <p>{t.featuredBody}</p>
          <div className="paper-links">
            <a href="https://doi.org/10.1016/j.jcp.2026.114713" target="_blank" rel="noreferrer">
              {t.paper}<span aria-hidden="true">↗</span>
            </a>
            <a href="https://github.com/S-Chenhao/compleX-PINN" target="_blank" rel="noreferrer">
              {t.code}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="cauchy-study" aria-hidden="true">
          <div className="study-label">CAUCHY LAYER / μ₁ μ₂ d</div>
          <div className="study-plane">
            <span className="curve curve-a" />
            <span className="curve curve-b" />
            <span className="study-point point-a" />
            <span className="study-point point-b" />
            <span className="study-point point-c" />
          </div>
          <div className="study-caption">Φ(x) = μ₁x/(x²+d²) + μ₂/(x²+d²)</div>
        </div>
      </section>

      <section className="metrics-band" aria-label={t.metricsLabel}>
        <p>{t.metricsLabel}</p>
        <dl>
          <div><dt>{t.metricCitations}</dt><dd>59</dd></div>
          <div><dt>{t.metricH}</dt><dd>3</dd></div>
          <div><dt>{t.metricWorks}</dt><dd>7</dd></div>
        </dl>
        <a
          href="https://scholar.google.com/citations?user=Vqf7dwEAAAAJ&hl=en"
          target="_blank"
          rel="noreferrer"
        >
          Google Scholar <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section id="publications" className="publications-section" aria-labelledby="publications-title">
        <div className="publication-heading">
          <p className="eyebrow"><span>03</span>{t.publicationsLabel}</p>
          <h2 id="publications-title">{t.publicationsTitle}</h2>
          <p>{t.publicationsIntro}</p>
        </div>

        <ol className="publication-list">
          {publications.map((publication, index) => (
            <li key={publication.title}>
              <a href={publication.url} target="_blank" rel="noreferrer" className="publication-link">
                <span className="publication-count">{String(index + 1).padStart(2, '0')}</span>
                <span className="publication-year">{publication.year}</span>
                <span className="publication-main">
                  <span className="publication-type">{publication.type}</span>
                  <strong>{language === 'zh' ? publication.titleZh : publication.title}</strong>
                  <span className="publication-authors">{publication.authors}</span>
                  <span className="publication-venue">{publication.venue}</span>
                </span>
                <span className="publication-meta">
                  <span>{publication.citations} {t.citations}</span>
                  <span>{t.open} ↗</span>
                </span>
              </a>
              {publication.code && (
                <a className="inline-code-link" href={publication.code} target="_blank" rel="noreferrer">
                  CODE ↗
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-title">
        <div className="about-intro">
          <p className="eyebrow"><span>04</span>{t.aboutLabel}</p>
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p>{t.aboutBody}</p>
        </div>

        <div className="trajectory-card">
          <div className="trajectory-top">
            <span>{t.current}</span>
            <span>{t.period}</span>
          </div>
          <h3>{t.degree}</h3>
          <p>{t.school}</p>
          <div className="trajectory-line" aria-hidden="true"><i /></div>
          <div className="focus-block">
            <p>{t.focusLabel}</p>
            <ul>
              {t.focus.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <div className="kinetic-line" aria-hidden="true">
        <span>PHYSICS × LEARNING × OPTIMIZATION × PDE × PHYSICS × LEARNING × OPTIMIZATION × PDE ×</span>
      </div>

      <section id="contact" className="contact-section" aria-labelledby="contact-title">
        <p className="eyebrow"><span>05</span>{t.contactLabel}</p>
        <h2 id="contact-title">{t.contactTitle}</h2>
        <p>{t.contactBody}</p>
        <div className="contact-links">
          <a href="mailto:222042011@link.cuhk.edu.cn">
            <span>{t.email}</span>222042011@link.cuhk.edu.cn <i aria-hidden="true">↗</i>
          </a>
          <a href="https://github.com/S-Chenhao" target="_blank" rel="noreferrer">
            <span>{t.github}</span>github.com/S-Chenhao <i aria-hidden="true">↗</i>
          </a>
          <a href="https://orcid.org/0009-0006-5314-4632" target="_blank" rel="noreferrer">
            <span>{t.orcid}</span>0009-0006-5314-4632 <i aria-hidden="true">↗</i>
          </a>
        </div>
        <footer>
          <span>© 2026 Chenhao Si</span>
          <span>{t.sourceNote}</span>
          <a href="#top">↑ TOP</a>
        </footer>
      </section>
    </main>
  );
}
