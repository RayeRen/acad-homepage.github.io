/*
 * Small, purposeful motion — not decoration for its own sake:
 *  - hero stat numbers count up once, when they scroll into view
 *  - the before/after bars in each metric-chart grow to their real value
 *  - cards fade in as you scroll to them
 * Everything here is progressive enhancement: if JS fails, every number,
 * bar and card is already showing its correct final state in the HTML.
 * Respects prefers-reduced-motion.
 *
 * Safety net: a fast scroll jump (anchor link, Page Down, etc.) can carry
 * an element straight past the viewport without ever registering as
 * "intersecting", which would otherwise leave it stuck at opacity:0 or
 * width:0 forever. A short fallback timer force-resolves anything the
 * observer hasn't caught yet, so nothing can end up permanently hidden.
 */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function countUp(el) {
    if (el.dataset.cwDone) return;
    el.dataset.cwDone = '1';
    var raw = el.textContent.trim();
    var match = raw.match(/^([\d.]+)(.*)$/);
    if (!match) return;
    var target = parseFloat(match[1]);
    var suffix = match[2] || '';
    var decimals = (match[1].split('.')[1] || '').length;
    var duration = 900;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = target * easeOutExpo(progress);
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  function growBar(el) {
    if (el.dataset.cwDone) return;
    el.dataset.cwDone = '1';
    var target = el.style.width;
    if (!target) return;
    el.style.width = '0%';
    // force reflow so the transition actually runs from 0
    void el.offsetWidth;
    requestAnimationFrame(function () {
      el.style.width = target;
    });
  }

  function reveal(el) {
    if (el.dataset.cwDone) return;
    el.dataset.cwDone = '1';
    el.classList.add('is-visible');
  }

  function resolveTarget(el) {
    if (el.classList.contains('cw-stats')) {
      el.querySelectorAll('.cw-stat b').forEach(countUp);
    } else if (el.classList.contains('metric-chart')) {
      el.querySelectorAll('.metric-chart-bar').forEach(growBar);
    } else {
      reveal(el);
    }
  }

  // Home page mascot: the dog sits fixed in the bottom-right corner and
  // runs in once (pure CSS) shortly after load. Click/tap it and it
  // either digs — a short dig-loop plays on the dog's own image, then
  // it spits the found item out of its mouth onto the ground, where it
  // lands with a bounce and carries a short label on its own blank
  // plaque (tap it to zoom in on the full text, and for project finds,
  // a real link) — or just stands and thinks, popping a short thought
  // bubble above its head with no digging at all. With no click, the
  // dog retreats to a small sliver peeking in from the screen's
  // bottom-right edge (bored expression, excited on hover); clicking
  // that just pops him back out to full size — a second click is what
  // actually digs or thinks. Every other page carries only that small
  // peeking form, always in "just think" mode, drawing from a pool of
  // thoughts tailored to that page (About/home get the general
  // dog-humor-and-site-jokes pool; CV and Projects get their own).
  // Whatever's currently shown — dug-up item or thought bubble — just
  // stays up; only a fresh click, or drifting idle long enough to
  // retreat to the peek form, replaces it. Each dig entry has a short
  // label (what fits on the tiny plaque) and a full line (shown once
  // zoomed in); each thought is just a single line, shown directly in
  // the bubble.
  var CW_THOUGHTS = {
    en: {
      general: [
        "Okay, I live in this corner now. It's official.",
        "Still no squirrels. Two years and counting.",
        "I don't code. I supervise. Big difference.",
        "Two years on this site, zero belly rubs. Just saying.",
        "Not in my job description. I don't have one of those.",
        "I buried a sock in here somewhere. Long story.",
        "You scrolled this far? Respect.",
        "This is basically my LinkedIn at this point.",
        "Four years of grad school and she still throws the ball wrong.",
        "Technically this is my website too.",
        "The site's live. Where's the party, though.",
        "Every page, every scroll — yeah, still me.",
        "I dug a hole under 'Contact' once. Never found the bottom.",
        "She built this whole thing. I mostly just watched.",
        "Go ahead, ask me anything. I only know one trick, though.",
        "This corner's mine. The rest is negotiable.",
        "Can't read. Just like standing near the words.",
        "Still scrolling? Might as well hire her.",
        "Someone called me the best part of this site. Correct.",
        "Two degrees, one dog, and only one of us finished obedience school."
      ],
      cv: [
        "Download button's up top. I'd click it if I had thumbs.",
        "Two degrees are buried somewhere on this page. Worth the dig.",
        "I proofread the whole résumé. Mostly by chewing the corners.",
        "She's had more job titles than I've had walks. That's a lot of walks.",
        "There's a PDF too, in case you want to take her home with you.",
        "I did the formatting. The bullet points were my idea, actually.",
        "Somewhere on this page is a very good reason to hire her.",
        "Every line here is true. I checked. Okay, I sniffed.",
        "This résumé's shorter than my snack list. Barely.",
        "If you're skimming, at least hit that download button."
      ],
      projects: [
        "She built an FX trading strategy. It trades. I nap. Balanced team.",
        "MultiDocRAG answers questions across a pile of documents at once. I ask one question, repeatedly: where's the treat jar.",
        "She built an iris-recognition system once. My eyes only recognize the treat jar, for the record.",
        "Six projects live on this page. My contribution: moral support, mostly napping.",
        "She's got a project that helps companies spot who might quit before they do. Pro tip: it's whoever isn't getting walks.",
        "Every project down here actually shipped. Unlike my last hole, which I abandoned halfway to China.",
        "Confused by a project title? The card underneath explains it in plain English. Unlike me, most days.",
        "Pick a card, click in — more effort went into it than any hole I've ever dug.",
        "She likes projects with real numbers behind them. I like tennis balls. We're both consistent, at least.",
        "FX trading, document search, an iris scanner — scroll down, it's basically her résumé with better graphics."
      ]
    },
    zh: {
      general: [
        "行吧，我就是住这个角落了，官宣。",
        "两年了，一只松鼠都没见着，我很生气。",
        "我不写代码，我就负责监工，分工不同。",
        "在这个网站待了两年，一次没被撸过，这笔账我记着呢。",
        "这不属于我的工作范围，我也没有工作范围。",
        "我在这儿埋过一只袜子，别问细节。",
        "能翻到这儿，算你有耐心，佩服。",
        "这基本就是我的简历了。",
        "读了那么多年书，扔球还是扔不准，绝了。",
        "严格来说这网站也有我一半功劳。",
        "网站都上线了，庆功宴在哪呢？",
        "每一页、每一次下滑——对，还是我。",
        "我在“联系方式”底下埋过东西，到现在没挖出来。",
        "这网站是她一个人搭的，我全程负责在旁边看着。",
        "有什么想问的尽管问，不过我就会一个绝活。",
        "这个角落是我的，别的都好商量。",
        "我不识字，就是喜欢待在字旁边。",
        "都翻到这儿了，不如考虑一下雇她。",
        "有人说我是这个网站最大的亮点，我没反驳。",
        "两个学位，一只狗，就我服从性训练没毕业。"
      ],
      cv: [
        "上面有个下载按钮，我要是有大拇指肯定替你点了。",
        "两个学位就藏在这页里，翻一下就找到了。",
        "这份简历我校对过了，主要是啃着看的。",
        "她换过的职位比我遛过的弯还多。",
        "还有 PDF 版，方便你把这份简历带走。",
        "排版是我盯的，项目符号都是我出的主意。",
        "这页里藏着一个雇她的理由，自己找找看。",
        "上面写的都是真的，我确认过，用鼻子确认的。",
        "这份简历比我的零食清单还短，就短一点点。",
        "时间紧的话，至少点一下那个下载按钮。"
      ],
      projects: [
        "她做过一个外汇交易策略，策略负责赚钱，我负责睡觉，分工均匀。",
        "MultiDocRAG 能一次性从一堆文档里问出答案，我也就会问一个问题：零食罐在哪。",
        "她还做过虹膜识别系统，我的眼睛就只认零食罐。",
        "这页上六个项目，我的贡献是——在旁边趴着，精神支持。",
        "她有个项目能提前看出谁可能要离职，我猜大概率是没人遛的那批。",
        "这页上的项目全都上线了，不像我上次挖洞挖到一半就放弃了。",
        "看不懂项目名字没关系，下面卡片会用大白话讲清楚，我就不行。",
        "随便点一张卡片进去看看，里面下的功夫比我挖过的任何一个坑都多。",
        "她喜欢做背后有真实数据支撑的项目，我喜欢网球，我们都挺专一的。",
        "外汇交易、文档问答、虹膜识别——翻下去都能看到，基本就是她的简历plus版。"
      ]
    }
  };

  var CW_DIG_ITEMS = {
    en: {
      bone: {
        weight: 38,
        dogImg: 'dog-found.png',
        icon: 'tag-bone.png',
        entries: [
          { short: '25% less review', full: 'My mom cut review workload ~25% across 7 systems.' },
          { short: '10K+ customers', full: 'My mom segmented 10K+ customers for a real conversion lift.' },
          { short: 'Attrition -19%', full: "My mom's models helped cut attrition by ~19%." },
          { short: 'Columbia · quant', full: 'My mom studied data science at Columbia, and did quant research before that.' },
          { short: "It's Cheng's dog", full: "I'm Cheng's dog — she built this whole site herself." },
          { short: '2 deg · 6 shipped', full: "My mom's got 2 degrees and 6 shipped projects under her belt." }
        ]
      },
      gift: {
        weight: 20,
        dogImg: 'dog-found.png',
        icon: 'tag-gift.png',
        entries: [
          { short: 'FX', lead: 'My mom built an FX trend strategy.', linkText: 'Take a look →', href: '/projects/#card-project_fx' },
          { short: 'RAG', lead: 'Curious about MultiDocRAG?', linkText: 'Check it out →', href: '/projects/#card-project_multidoc' },
          { short: 'IRIS', lead: 'My mom built an iris recognition system.', linkText: 'See how →', href: '/projects/#card-project_iris' }
        ]
      },
      can: {
        weight: 12,
        dogImg: 'dog-sad.png',
        icon: 'tag-can.png',
        entries: [
          { short: 'meh', full: 'I dug up... nothing. Sorry about that.' },
          { short: 'dirt', full: 'Just dirt. Worth a shot though.' },
          { short: 'oops', full: 'Okay, that one’s on me.' },
          { short: 'nope', full: 'Nope. Try again later?' }
        ]
      }
    },
    zh: {
      bone: {
        weight: 38,
        dogImg: 'dog-found.png',
        icon: 'tag-bone.png',
        entries: [
          { short: '审核-25%', full: '我妈妈帮 7 个系统把审核量降了约 25%。' },
          { short: '万级分群', full: '我妈妈为 1 万+ 客户做分群，带来了实打实的转化提升。' },
          { short: '流失降19%', full: '我妈妈用模型把流失率降了约 19%。' },
          { short: '哥大', full: '我妈妈在哥伦比亚大学读的数据科学，之前还做过量化研究。' },
          { short: '这是吴骋的狗', full: '我是吴骋的狗，这个网站是她自己搭的。' },
          { short: '2学位 6项目', full: '我妈妈读了 2 个学位，上线过 6 个项目。' }
        ]
      },
      gift: {
        weight: 20,
        dogImg: 'dog-found.png',
        icon: 'tag-gift.png',
        entries: [
          { short: 'FX', lead: '我妈妈做过一个外汇趋势交易策略。', linkText: '看看 →', href: '/zh/projects/#card-project_fx' },
          { short: 'RAG', lead: '对 MultiDocRAG 感兴趣？', linkText: '了解一下 →', href: '/zh/projects/#card-project_multidoc' },
          { short: 'IRIS', lead: '我妈妈做过一个虹膜识别系统。', linkText: '看看怎么做的 →', href: '/zh/projects/#card-project_iris' }
        ]
      },
      can: {
        weight: 12,
        dogImg: 'dog-sad.png',
        icon: 'tag-can.png',
        entries: [
          { short: '呃', full: '挖到的是……什么都没有，不好意思。' },
          { short: '土', full: '只有土，不过值得一试。' },
          { short: '错', full: '这个我认。' },
          { short: '空', full: '没挖到，要不再试一次？' }
        ]
      }
    }
  };

  // The "think" outcome just needs a weight to compete with bone/gift/can
  // in the pick below — its actual lines come from CW_THOUGHTS.general
  // via the shuffle bag in setupDogDig, not from a flat entries list.
  ['en', 'zh'].forEach(function (lang) {
    CW_DIG_ITEMS[lang].think = { weight: 30 };
  });

  function weightedPick(pools) {
    var keys = Object.keys(pools);
    var total = keys.reduce(function (sum, k) { return sum + pools[k].weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < keys.length; i++) {
      r -= pools[keys[i]].weight;
      if (r <= 0) return keys[i];
    }
    return keys[keys.length - 1];
  }

  // Hands back entries from a pool in random order with no immediate
  // repeats: a full shuffled pass through the pool before anything can
  // come up twice, rather than plain chance re-picking the same line
  // back to back.
  function makeShuffleBag(items) {
    var bag = [];
    var last = null;

    function refill() {
      bag = items.slice();
      for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = bag[i];
        bag[i] = bag[j];
        bag[j] = tmp;
      }
      // Next item served is bag[bag.length - 1] (we pop from the end) —
      // make sure a reshuffle doesn't immediately repeat the last thing
      // shown right at the seam between two passes.
      if (bag.length > 1 && bag[bag.length - 1] === last) {
        var swapWith = Math.floor(Math.random() * (bag.length - 1));
        var t = bag[bag.length - 1];
        bag[bag.length - 1] = bag[swapWith];
        bag[swapWith] = t;
      }
    }

    return function next() {
      if (bag.length === 0) refill();
      var picked = bag.pop();
      last = picked;
      return picked;
    };
  }

  // How long the dog waits before retreating: quickly if nothing's on
  // screen, and the same short window even once he's shown something
  // (a dug-up item or a thought bubble) — long enough for a sentence,
  // not indefinite.
  var IDLE_MS = 5000;
  var RESULT_MS = 5000;

  function setupDogDig() {
    var corner = document.getElementById('cw-corner-dog');
    var dogBtn = document.getElementById('cw-dog-dig');
    var dogImg = document.getElementById('cw-dog-dig-img');
    var hint = document.getElementById('cw-dig-hint');
    var item = document.getElementById('cw-dig-item');
    var itemImg = document.getElementById('cw-dig-item-img');
    var bubble = document.getElementById('cw-think-bubble');
    var bubbleText = document.getElementById('cw-think-bubble-text');
    var zoom = document.getElementById('cw-dig-zoom');
    var zoomBackdrop = document.getElementById('cw-dig-zoom-backdrop');
    var zoomItemWrap = document.getElementById('cw-dig-zoom-item-wrap');
    var zoomImg = document.getElementById('cw-dig-zoom-img');
    var zoomItemText = document.getElementById('cw-dig-zoom-item-text');
    var zoomText = document.getElementById('cw-dig-zoom-text');
    if (!corner || !dogBtn || !dogImg || !hint || !item || !itemImg || !bubble || !bubbleText || !zoom || !zoomBackdrop || !zoomItemWrap || !zoomImg || !zoomItemText || !zoomText) return;

    var lang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
    var pools = CW_DIG_ITEMS[lang];
    var pickThought = makeShuffleBag(CW_THOUGHTS[lang].general);
    var base = dogImg.getAttribute('src').replace(/dog-idle\.png$/, '');
    var busy = false;
    var currentKind = null;
    var currentEntry = null;
    var currentIcon = null;
    var idleTimer = null;
    var tiltTimer = null;
    var breathTimer = null;
    var resultBreathTimer = null;

    // A quiet "breathing" loop for the full-size dog while he's just
    // standing there — mouth closed, then panting for a while, back to
    // closed, repeat — so he's not a single frozen frame the whole time
    // he's waiting for a click. Runs only while nothing else owns his
    // image (not mid-dig, not showing a dug-up result, not peeked) and
    // never for prefers-reduced-motion. Most pants use the two subtle
    // mouth-open frames; every so often (~30%) he flashes the bigger
    // tongue-out "found" pose instead, for an actual "sticks his tongue
    // out now and then" beat rather than every pant reading the same as
    // the last one. Randomized hold times keep it from reading as a
    // mechanical loop.
    var DOG_IDLE_PANT = ['dog-idle-open-1.png', 'dog-idle-open-2.png'];
    var DOG_IDLE_TONGUE_OUT_CHANCE = 0.3;

    function stopIdleBreathing() {
      if (breathTimer) {
        clearTimeout(breathTimer);
        breathTimer = null;
      }
    }

    function scheduleBreath(open) {
      if (!open) {
        breathTimer = setTimeout(function () {
          dogImg.src = base + 'dog-idle.png';
          scheduleBreath(true);
        }, 2200 + Math.random() * 2000); // mouth-closed hold: ~2.2–4.2s
        return;
      }
      var tongueOut = Math.random() < DOG_IDLE_TONGUE_OUT_CHANCE;
      var delay = tongueOut
        ? 650 + Math.random() * 500    // tongue-out flourish, held briefly
        : 900 + Math.random() * 1100;  // plain panting hold: ~0.9–2.0s
      breathTimer = setTimeout(function () {
        dogImg.src = tongueOut
          ? base + 'dog-found.png'
          : base + DOG_IDLE_PANT[Math.floor(Math.random() * DOG_IDLE_PANT.length)];
        scheduleBreath(false);
      }, delay);
    }

    function startIdleBreathing() {
      if (reduceMotion || breathTimer) return;
      dogImg.src = base + 'dog-idle.png';
      scheduleBreath(true);
    }

    // Same idea, but for the "found" result (bone/gift) once it's on
    // screen: a quick alternation between the full tongue-out grin and
    // a lighter pant frame, so an excited result also keeps moving
    // instead of sitting as one static picture for the whole RESULT_MS
    // it's shown. Faster cadence than idle breathing since this is an
    // excited beat, not a restful one.
    var DOG_FOUND_PANT = 'dog-idle-open-1.png';

    function stopResultBreathing() {
      if (resultBreathTimer) {
        clearTimeout(resultBreathTimer);
        resultBreathTimer = null;
      }
    }

    function scheduleResultBreath(pant) {
      resultBreathTimer = setTimeout(function () {
        dogImg.src = pant ? base + DOG_FOUND_PANT : base + 'dog-found.png';
        scheduleResultBreath(!pant);
      }, pant ? 550 + Math.random() * 400 : 750 + Math.random() * 500);
    }

    function startResultBreathing() {
      if (reduceMotion || resultBreathTimer) return;
      scheduleResultBreath(true);
    }

    // The "tap to see what he found" hint only needs to be seen once
    // per visitor — after that it's just noise. Remembered across
    // visits when localStorage is available; otherwise it still won't
    // repeat within this page load.
    var HINT_SEEN_KEY = 'cw-dig-hint-seen';
    var hintSeen = false;
    try {
      hintSeen = window.localStorage.getItem(HINT_SEEN_KEY) === '1';
    } catch (e) {}

    // With no click on the full-size dog, he retreats to the small
    // peek form — clearing away whatever's currently shown as part of
    // that. Paused while he's mid-dig or the zoom card is open, and
    // re-armed every time he settles back down.
    function armIdleTimer(delay) {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        idleTimer = null;
        if (!busy && !zoom.classList.contains('is-open')) {
          stopIdleBreathing();
          clearResults();
          corner.classList.add('is-peek');
        }
      }, delay || IDLE_MS);
    }

    // Whichever wait currently applies: short if nothing's on screen,
    // long if an item or thought bubble is actively shown.
    function currentIdleDelay() {
      var showingSomething = item.classList.contains('is-visible') || bubble.classList.contains('is-visible');
      return showingSomething ? RESULT_MS : IDLE_MS;
    }

    function clearIdleTimer() {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function openZoom() {
      if (!currentEntry) return;
      hint.classList.remove('is-visible');
      // The zoom card now carries the full text — the little plaque on
      // the ground has nothing left to do, and leaving it up just risks
      // it still being there (with the dog long since retreated) once
      // the card is closed again.
      item.classList.remove('is-visible');
      zoomItemWrap.setAttribute('data-item', currentKind);
      zoomImg.src = currentIcon;
      zoomItemText.textContent = currentEntry.short;
      zoomText.textContent = '';
      if (currentEntry.href) {
        zoomText.appendChild(document.createTextNode(currentEntry.lead + ' '));
        var link = document.createElement('a');
        link.href = currentEntry.href;
        link.textContent = currentEntry.linkText;
        zoomText.appendChild(link);
      } else {
        zoomText.textContent = currentEntry.full;
      }
      zoom.classList.add('is-open');
    }

    function closeZoom() {
      var wasOpen = zoom.classList.contains('is-open');
      zoom.classList.remove('is-open');
      // The idle timer may have fired (and no-opped) while the zoom
      // card blocked it — pick it back up now that it's closed.
      if (wasOpen && !idleTimer && !corner.classList.contains('is-peek')) {
        armIdleTimer(currentIdleDelay());
      }
    }

    item.addEventListener('click', openZoom);
    zoomBackdrop.addEventListener('click', closeZoom);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeZoom();
    });

    function showItem(kind) {
      var pool = pools[kind];
      var entry = pool.entries[Math.floor(Math.random() * pool.entries.length)];
      currentKind = kind;
      currentEntry = entry;
      currentIcon = base + pool.icon;

      bubble.classList.remove('is-visible');
      dogBtn.classList.remove('is-thinking');

      item.setAttribute('data-item', kind);
      itemImg.src = currentIcon;
      dogImg.src = base + pool.dogImg;

      // Neither result outcome is a single frozen frame: a happy find
      // gets a quick excited pant alternation (startResultBreathing);
      // an empty one gets a slow scale "breath" since there's only one
      // sad-pose frame today — swap in a second dog-sad-2.png and drive
      // it through startResultBreathing()-style alternation instead of
      // this class once that art exists.
      stopResultBreathing();
      dogImg.classList.remove('is-sad-breathe');
      if (pool.dogImg === 'dog-found.png') {
        startResultBreathing();
      } else if (pool.dogImg === 'dog-sad.png' && !reduceMotion) {
        dogImg.classList.add('is-sad-breathe');
      }

      item.classList.remove('is-visible');
      hint.classList.remove('is-visible');
      void item.offsetWidth; // restart the land animation even on repeat clicks
      item.classList.add('is-visible');

      if (!hintSeen) {
        hint.classList.add('is-visible');
        hintSeen = true;
        try {
          window.localStorage.setItem(HINT_SEEN_KEY, '1');
        } catch (e) {}
      }

      // Something's actually on screen now — give it real reading time
      // before the idle retreat clears it away again.
      armIdleTimer(RESULT_MS);
    }

    function showThought() {
      currentKind = 'think';
      currentEntry = null;
      item.classList.remove('is-visible');
      hint.classList.remove('is-visible');
      closeZoom();

      var wasVisible = bubble.classList.contains('is-visible');
      bubbleText.textContent = pickThought();
      if (!wasVisible) {
        bubble.classList.remove('is-visible');
        void bubble.offsetWidth; // play the pop-in only when it wasn't already showing
        bubble.classList.add('is-visible');
      }

      // A brief head-tilt marks the moment he "thinks," separate from
      // how long the bubble itself stays up.
      dogBtn.classList.remove('is-thinking');
      void dogBtn.offsetWidth;
      dogBtn.classList.add('is-thinking');
      if (tiltTimer) clearTimeout(tiltTimer);
      tiltTimer = setTimeout(function () {
        dogBtn.classList.remove('is-thinking');
      }, 1300);

      // Same deal as showItem(): give the bubble real reading time
      // before the idle retreat clears it.
      armIdleTimer(RESULT_MS);
    }

    // Clears whatever's currently on display (dug-up item or thought
    // bubble) so the dog can retreat to peek, or start fresh. Nothing
    // times this out on its own otherwise — once shown, a result just
    // stays until the next click or an idle retreat replaces it.
    function clearResults() {
      item.classList.remove('is-visible');
      hint.classList.remove('is-visible');
      bubble.classList.remove('is-visible');
      dogBtn.classList.remove('is-thinking');
      if (tiltTimer) {
        clearTimeout(tiltTimer);
        tiltTimer = null;
      }
      closeZoom();
      stopResultBreathing();
      dogImg.classList.remove('is-sad-breathe');
      dogImg.src = base + 'dog-idle.png';
      currentEntry = null;
    }

    dogBtn.addEventListener('click', function () {
      if (busy) return;

      // Peeking: this click just pops him back out to full size. It
      // doesn't dig or think by itself — the next click does that.
      // Popping out is always a clean slate: nothing left over from
      // before should still be sitting on the ground or in the bubble.
      if (corner.classList.contains('is-peek')) {
        corner.classList.remove('is-peek');
        item.classList.remove('is-visible');
        bubble.classList.remove('is-visible');
        stopResultBreathing();
        dogImg.classList.remove('is-sad-breathe');
        armIdleTimer();
        startIdleBreathing();
        return;
      }

      // Stop any pending retreat while we handle this click — showThought()
      // or showItem() will arm the right (longer) wait once something is
      // actually back on screen.
      clearIdleTimer();

      var kind = weightedPick(pools);

      if (kind === 'think') {
        showThought();
        return;
      }

      if (reduceMotion) {
        showItem(kind);
        return;
      }

      stopIdleBreathing();
      stopResultBreathing();
      dogImg.classList.remove('is-sad-breathe');
      busy = true;
      bubble.classList.remove('is-visible');
      dogBtn.classList.remove('is-thinking');

      var frames = ['dog-dig-1.png', 'dog-dig-2.png', 'dog-dig-3.png', 'dog-dig-1.png', 'dog-dig-2.png'];
      var i = 0;
      var digTimer = setInterval(function () {
        dogImg.src = base + frames[i % frames.length];
        dogImg.classList.toggle('is-bump');
        i++;
      }, 120);

      setTimeout(function () {
        clearInterval(digTimer);
        dogImg.classList.remove('is-bump');
        showItem(kind);
        busy = false;
      }, 620);
    });

    armIdleTimer();
    startIdleBreathing();
  }

  // Every page besides home carries only the small peeking form —
  // bored by default, excited on hover (pure CSS) — and a click
  // always pops a short thought bubble above his head, drawn from
  // whichever pool fits that page (falls back to the general one).
  // Never digs, never expands to full size. Once shown, the bubble
  // stays up long enough to actually read (RESULT_MS), then clears
  // itself away on its own — same as the home page's idle retreat —
  // and a repeat click before then just swaps in a new line in place
  // rather than hiding and popping back in.
  function setupDogPeek() {
    var peekBtn = document.getElementById('cw-dog-peek');
    var bubble = document.getElementById('cw-think-bubble');
    var bubbleText = document.getElementById('cw-think-bubble-text');
    if (!peekBtn || !bubble || !bubbleText) return;

    var lang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
    var page = document.body.getAttribute('data-cw-page');
    var pool = CW_THOUGHTS[lang][page] || CW_THOUGHTS[lang].general;
    var pickThought = makeShuffleBag(pool);
    var tiltTimer = null;
    var clearTimer = null;

    function armClearTimer() {
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(function () {
        clearTimer = null;
        bubble.classList.remove('is-visible');
        peekBtn.classList.remove('is-thinking');
      }, RESULT_MS);
    }

    peekBtn.addEventListener('click', function () {
      var wasVisible = bubble.classList.contains('is-visible');
      bubbleText.textContent = pickThought();
      if (!wasVisible) {
        bubble.classList.remove('is-visible');
        void bubble.offsetWidth; // play the pop-in only when it wasn't already showing
        bubble.classList.add('is-visible');
      }

      peekBtn.classList.remove('is-thinking');
      void peekBtn.offsetWidth;
      peekBtn.classList.add('is-thinking');
      if (tiltTimer) clearTimeout(tiltTimer);
      tiltTimer = setTimeout(function () {
        peekBtn.classList.remove('is-thinking');
      }, 1300);

      armClearTimer();
    });
  }

  // Dark mode toggle in the masthead. The actual theme values live in
  // CSS (data-theme attribute + a prefers-color-scheme fallback); this
  // just flips between an explicit "light" and "dark" and remembers it
  // for next time. A separate inline script in <head> re-applies the
  // saved choice before first paint, so there's no flash on load.
  function setupThemeToggle() {
    var btn = document.getElementById('cw-theme-toggle');
    if (!btn) return;
    var STORAGE_KEY = 'cw-theme';

    function currentTheme() {
      var explicit = document.documentElement.getAttribute('data-theme');
      if (explicit === 'light' || explicit === 'dark') return explicit;
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  }

  // Home-page opening animation: a brief sequence, played on every load
  // of this page, where a wall of "raw data" gets cleaned down to a
  // handful of points, those points form a scattered cloud with a fitted
  // S-curve, then scatter out onto the real hero stat numbers as they
  // count up. The overlay markup is display:none by default (see
  // _sass/_intro.scss) and an early inline script in the layout is the
  // only thing that turns it on (respecting prefers-reduced-motion) —
  // this function only runs the sequencing once that script has already
  // decided to show it.
  //
  // The final "numbers land and count up" moment reuses the site's
  // same countUp() used for the normal scroll-into-view reveal, so
  // there's only one counting implementation. The stat elements are
  // pre-claimed (dataset.cwDone) so that reveal doesn't also fire while
  // the intro is still playing.
  function setupHomeIntro() {
    var overlay = document.getElementById('cw-intro-overlay');
    if (!overlay || overlay.style.display !== 'flex') return;

    var statEls = Array.prototype.slice.call(document.querySelectorAll('.cw-stats .cw-stat b'));
    if (!statEls.length) {
      overlay.style.display = 'none';
      return;
    }

    overlay.dataset.cwIntroStarted = '1';

    var titlebar = overlay.querySelector('.cw-intro-titlebar');
    var gridArea = overlay.querySelector('.cw-intro-grid-area');
    var grid = document.getElementById('cw-intro-grid');

    var originalText = statEls.map(function (el) { return el.textContent; });
    statEls.forEach(function (el) {
      el.dataset.cwDone = '1'; // pre-claim so the scroll-reveal system leaves it alone
      el.textContent = '0';
    });

    function gridDims() {
      var w = window.innerWidth;
      if (w < 480) return { cols: 7, rows: 14, keep: 16 };
      if (w < 900) return { cols: 11, rows: 13, keep: 20 };
      return { cols: 17, rows: 12, keep: 24 };
    }

    function randNum() {
      var r = Math.random();
      if (r < 0.3) return (Math.random() * 10).toFixed(2);
      if (r < 0.6) return String(Math.floor(Math.random() * 900) + 10);
      return String(Math.floor(Math.random() * 90000) / 100);
    }

    var dims = gridDims();
    var COLS = dims.cols, ROWS = dims.rows, N_CELLS = COLS * ROWS, N_KEEP = dims.keep;

    function buildGrid() {
      grid.innerHTML = '';
      grid.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
      var keepIdx = {};
      while (Object.keys(keepIdx).length < N_KEEP) {
        keepIdx[Math.floor(Math.random() * N_CELLS)] = true;
      }
      var cells = [];
      for (var i = 0; i < N_CELLS; i++) {
        var row = Math.floor(i / COLS);
        var c = document.createElement('div');
        c.className = 'cw-intro-cell' + (row % 2 === 1 ? ' cw-intro-band' : '');
        c.textContent = randNum();
        c.dataset.keep = keepIdx[i] ? '1' : '0';
        c.dataset.row = row;
        grid.appendChild(c);
        cells.push(c);
      }
      return cells;
    }

    // Logistic S-curve: reads as a real fitted trend rather than a plain
    // straight line — steep rise through the middle, easing at each end.
    function sig(t) { return 1 / (1 + Math.exp(-11 * (t - 0.5))); }

    function curveGeometry() {
      var cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 10;
      var w = Math.min(240, window.innerWidth * 0.42);
      return { cx: cx, cy: cy, w: w, h: 70 };
    }

    var timers = [];
    var odots = [];
    var fitLineSvg = null, fitPath = null;
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function drawFitLine(g) {
      if (fitLineSvg) fitLineSvg.remove();
      var svgNS = 'http://www.w3.org/2000/svg';
      fitLineSvg = document.createElementNS(svgNS, 'svg');
      fitLineSvg.setAttribute('width', '100%');
      fitLineSvg.setAttribute('height', '100%');
      fitLineSvg.style.position = 'fixed';
      fitLineSvg.style.inset = 0;
      fitLineSvg.style.zIndex = 59;
      fitLineSvg.style.pointerEvents = 'none';
      fitPath = document.createElementNS(svgNS, 'path');
      fitPath.setAttribute('class', 'cw-intro-fit-line');
      var d = '';
      var STEPS = 28;
      for (var i = 0; i <= STEPS; i++) {
        var t = i / STEPS;
        var x = g.cx - g.w / 2 + t * g.w;
        var y = g.cy + g.h / 2 - sig(t) * g.h;
        d += (i === 0 ? 'M ' : 'L ') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      fitPath.setAttribute('d', d.trim());
      fitLineSvg.appendChild(fitPath);
      overlay.appendChild(fitLineSvg);
      var len = fitPath.getTotalLength();
      fitPath.style.strokeDasharray = len;
      fitPath.style.strokeDashoffset = len;
      void fitPath.getBoundingClientRect();
      fitPath.style.transition = 'stroke-dashoffset 0.45s ease';
      fitPath.style.strokeDashoffset = 0;
    }

    function stage2Scatter() {
      var g = curveGeometry();
      odots.forEach(function (d, i) {
        var t = odots.length > 1 ? i / (odots.length - 1) : 0.5;
        var x = g.cx - g.w / 2 + t * g.w;
        var y = g.cy + g.h / 2 - sig(t) * g.h + (Math.random() - 0.5) * 12;
        d.style.transition = 'left 0.5s cubic-bezier(.3,.8,.3,1) ' + (i * 5) + 'ms, top 0.5s cubic-bezier(.3,.8,.3,1) ' + (i * 5) + 'ms';
        d.style.left = x + 'px';
        d.style.top = y + 'px';
      });
      timers.push(setTimeout(function () { drawFitLine(g); }, 160));
    }

    function stage3Land() {
      if (fitPath) fitPath.style.opacity = 0;
      var groups = statEls.map(function () { return []; });
      odots.forEach(function (d, i) { groups[i % groups.length].push(d); });
      statEls.forEach(function (el, gi) {
        var br = el.getBoundingClientRect();
        var cx = br.left + br.width / 2, cy = br.top + br.height / 2;
        groups[gi].forEach(function (d, k) {
          var x = cx + (Math.random() - 0.5) * 16;
          var y = cy + (Math.random() - 0.5) * 12;
          d.style.transition = 'left 0.45s cubic-bezier(.3,.7,.4,1) ' + (k * 5) + 'ms, top 0.45s cubic-bezier(.3,.7,.4,1) ' + (k * 5) + 'ms, opacity 0.3s ease ' + (260 + k * 5) + 'ms';
          d.style.left = x + 'px';
          d.style.top = y + 'px';
          d.style.opacity = 0;
        });
        el.textContent = originalText[gi];
        delete el.dataset.cwDone;
        countUp(el);
      });

      overlay.style.transition = 'opacity 0.45s ease';
      overlay.style.opacity = 0;
      timers.push(setTimeout(finish, 470));
    }

    function finish() {
      overlay.style.pointerEvents = 'none';
      overlay.style.display = 'none';
    }

    function skip() {
      clearTimers();
      statEls.forEach(function (el, i) {
        el.textContent = originalText[i];
        delete el.dataset.cwDone;
        el.dataset.cwDone = '1'; // already at final value, nothing left to animate
      });
      odots.forEach(function (d) { d.remove(); });
      odots = [];
      if (fitLineSvg) { fitLineSvg.remove(); fitLineSvg = null; }
      overlay.style.transition = 'none';
      overlay.style.opacity = 1;
      finish();
    }

    overlay.addEventListener('click', skip);
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key !== 'Escape') return;
      document.removeEventListener('keydown', onEsc);
      if (overlay.style.display !== 'none') skip();
    });

    var cells = buildGrid();
    var oldBar = gridArea.querySelector('.cw-intro-sweep');
    if (oldBar) oldBar.remove();
    var bar = document.createElement('div');
    bar.className = 'cw-intro-sweep';
    gridArea.appendChild(bar);

    var sweepMs = 700;
    var rowMs = sweepMs / ROWS;
    for (var r = 0; r < ROWS; r++) {
      (function (rowIndex) {
        timers.push(setTimeout(function () {
          cells.forEach(function (c) {
            if (parseInt(c.dataset.row, 10) !== rowIndex) return;
            if (c.dataset.keep === '1') {
              c.classList.add('cw-intro-keep');
              var rect = c.getBoundingClientRect();
              timers.push(setTimeout(function () {
                var d = document.createElement('div');
                d.className = 'cw-intro-odot';
                d.style.left = (rect.left + rect.width / 2) + 'px';
                d.style.top = (rect.top + rect.height / 2) + 'px';
                overlay.appendChild(d);
                odots.push(d);
                requestAnimationFrame(function () {
                  d.style.transition = 'opacity 0.2s ease';
                  d.style.opacity = 0.95;
                });
                c.classList.add('cw-intro-gone');
              }, 100));
            } else {
              c.classList.add('cw-intro-flag');
              timers.push(setTimeout(function () { c.classList.add('cw-intro-gone'); }, 90));
            }
          });
        }, rowIndex * rowMs));
      })(r);
    }

    var stage2At = sweepMs + 150;
    timers.push(setTimeout(stage2Scatter, stage2At));

    var stage3At = stage2At + 580;
    timers.push(setTimeout(stage3Land, stage3At));
  }

  /* Hero avatar tilt: a lightweight stand-in for a full photo-to-video
     rig (the "head turns with your cursor" effect some sites build by
     generating a rotating video from a photo) — no AI video generation
     involved, just the existing avatar photo reacting to the cursor
     with a 3D tilt + lift + a shifting purple glow, so it's clearly
     visible even on a flat, non-photographic avatar. Desktop/mouse
     only: a touch device never fires mousemove, so it's naturally
     inert there. Skipped entirely under reduced motion. */
  (function () {
    if (reduceMotion) return;
    var avatar = document.querySelector('.cw-home-hero .avatar');
    if (!avatar) return;

    var MAX_TILT = 22; // degrees
    var MAX_SHADOW = 16; // px offset at full tilt
    var EASE = 0.12;
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var raf = null;

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function render() {
      curX += (targetX - curX) * EASE;
      curY += (targetY - curY) * EASE;
      var mag = Math.min(1, Math.sqrt(curX * curX + curY * curY) / MAX_TILT);
      var scale = 1 + mag * 0.08;
      avatar.style.transform = 'perspective(500px) rotateX(' + curX.toFixed(2) + 'deg) rotateY(' + curY.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
      if (mag < 0.02) {
        avatar.style.filter = '';
      } else {
        var shadowX = (-curY / MAX_TILT) * MAX_SHADOW;
        var shadowY = (curX / MAX_TILT) * MAX_SHADOW + 6;
        avatar.style.filter = 'drop-shadow(' + shadowX.toFixed(1) + 'px ' + shadowY.toFixed(1) + 'px ' + (10 + mag * 10).toFixed(0) + 'px rgba(109, 65, 149, ' + (0.25 + mag * 0.25).toFixed(2) + '))';
      }
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    }

    function onMove(e) {
      var dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      var dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetY = clamp(dx * MAX_TILT, -MAX_TILT, MAX_TILT);
      targetX = clamp(-dy * MAX_TILT, -MAX_TILT, MAX_TILT);
      if (!raf) raf = requestAnimationFrame(render);
    }

    function onLeaveWindow() {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(render);
    }

    document.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeaveWindow);
  })();

  /* Shared confetti burst — a small self-contained canvas particle
     effect with no external library, used by both the CV-download
     celebration and the keyboard easter egg below. The canvas overlay
     is pointer-events:none and removes itself once every particle has
     faded, so it never lingers or blocks clicks on anything underneath. */
  function burstConfettiAt(x, y) {
    if (reduceMotion) return;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    var colors = ['#6d4195', '#9b6fc4', '#f2c14e', '#4caf87', '#e85d75'];
    var particles = [];
    for (var i = 0; i < 60; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -9 - 3,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 18,
        life: 0
      });
    }

    var gravity = 0.28;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      particles.forEach(function (p) {
        p.life++;
        var alpha = Math.max(0, 1 - p.life / 65);
        if (alpha <= 0) return;
        alive = true;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (alive) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  /* CV-download celebration: a one-off confetti burst from the button
     itself when someone downloads the resume. Purely additive — the
     click listener never calls preventDefault, so the actual download
     (href + download attribute, already on the page) is untouched and
     fires exactly as before even if confetti fails for any reason. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.cv-download-btn');
    if (!btn) return;
    try {
      var rect = btn.getBoundingClientRect();
      burstConfettiAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } catch (err) { /* never let decoration break the real download */ }
  });

  /* Console easter egg: a one-time friendly banner for anyone who pops
     open devtools (reviewers/engineers do this more than you'd think).
     Pure console output — no DOM changes, so it cannot affect the page. */
  (function () {
    try {
      var art = ' /\\_/\\ \n( o.o )\n > ^ < ';
      console.log('%c' + art, 'color:#6d4195; font-family:monospace; font-size:13px; font-weight:bold;');
      console.log('%cHi — thanks for taking a look under the hood. 👋', 'color:#6d4195; font-size:14px; font-weight:bold;');
      console.log('%cThis site is built and maintained by Thea Wu (MS Data Science @ Columbia). Contact links are in the footer — always happy to talk data/analytics roles.', 'color:#3a2050; font-size:12px;');
      console.log('%cPS: there\'s a keyboard easter egg hiding on this page somewhere. 🐾', 'color:#6b675f; font-size:11px; font-style:italic;');
    } catch (e) {}
  })();

  /* Keyboard easter egg: the classic Konami code, or just typing
     "woof", makes the corner dog do a happy little bounce + confetti.
     Targets the dog's own <img> (#cw-dog-dig-img), never the dig/peek
     state machine elsewhere in this file, so it can't interfere with
     that logic — worst case if something's off, the bounce just
     doesn't play. Invisible in "peek" mode since that image is
     opacity:0 there (see _custom-theme.scss), so nothing visually
     breaks on non-home pages either. */
  (function () {
    if (reduceMotion) return;
    var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    var codeBuffer = [];
    var wordBuffer = '';

    function triggerDogParty() {
      var dogImg = document.getElementById('cw-dog-dig-img');
      if (!dogImg || dogImg.classList.contains('cw-dog-party-bounce')) return;
      dogImg.classList.add('cw-dog-party-bounce');
      setTimeout(function () { dogImg.classList.remove('cw-dog-party-bounce'); }, 1300);
      try {
        burstConfettiAt(window.innerWidth - 90, window.innerHeight - 90);
      } catch (e) {}
    }

    document.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      codeBuffer.push(e.code);
      if (codeBuffer.length > KONAMI.length) codeBuffer.shift();
      if (codeBuffer.length === KONAMI.length && codeBuffer.every(function (c, i) { return c === KONAMI[i]; })) {
        triggerDogParty();
        codeBuffer = [];
      }

      if (e.key && e.key.length === 1) {
        wordBuffer = (wordBuffer + e.key.toLowerCase()).slice(-4);
        if (wordBuffer === 'woof') {
          triggerDogParty();
          wordBuffer = '';
        }
      }
    });
  })();

  /* Retro flip-digit visitor counter: hits a free, keyless counting
     API once per page load and renders the total as a row of digit
     tiles with a one-time flip-in. Pure decoration — any failure
     (offline, the third-party service being down, a CORS hiccup) is
     swallowed and just leaves the widget hidden; nothing else on the
     page depends on it. */
  (function () {
    var wrap = document.getElementById('cw-visitor-counter');
    var digitsEl = document.getElementById('cw-vc-digits');
    if (!wrap || !digitsEl) return;

    function renderDigits(n) {
      var str = String(n);
      digitsEl.innerHTML = '';
      for (var i = 0; i < str.length; i++) {
        var d = document.createElement('span');
        d.className = 'cw-vc-digit';
        if (!reduceMotion) {
          d.classList.add('cw-vc-digit-in');
          d.style.animationDelay = (i * 0.06) + 's';
        }
        d.textContent = str[i];
        digitsEl.appendChild(d);
      }
      wrap.classList.add('is-ready');
    }

    fetch('https://countapi.mileshilliard.com/api/v1/hit/chengwu-data-github-io-visits')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) { renderDigits(data.value); })
      .catch(function () { /* service unreachable — stay hidden, no error shown */ });
  })();

  document.addEventListener('DOMContentLoaded', function () {
    setupDogDig();
    setupDogPeek();
    setupThemeToggle();
    setupHomeIntro();

    var targets = [];

    document.querySelectorAll('.cw-stats').forEach(function (el) { targets.push(el); });
    document.querySelectorAll('.metric-chart').forEach(function (el) { targets.push(el); });
    document.querySelectorAll('.project-card, .section-container, .cv-container').forEach(function (el) {
      el.classList.add('cw-reveal');
      targets.push(el);
    });

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach(resolveTarget);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        resolveTarget(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    targets.forEach(function (el) { observer.observe(el); });

    // Safety net: whatever the observer hasn't caught within 1.8s
    // (fast scroll jumps, anchor links, etc.) gets resolved immediately.
    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.dataset.cwDone) {
          resolveTarget(el);
          observer.unobserve(el);
        }
      });
    }, 1800);
  });
})();
