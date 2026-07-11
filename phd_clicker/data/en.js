// English game data (text + numbers together) - ES Module format
import { SUBMISSION_DATA_EN } from './submission_en.js';

export const GAME_DATA_EN = {
    ui: {
        title: 'PhD Clicker',
        subtitle: 'Grinding for Academic Clout',
        rpLabel: 'Research Points (RP)',
        rpPerSec: '+{value} / sec',
        citationsLabel: 'Citations',
        citationsRateLabel: 'Citation Rate',
        papersLabel: 'Papers',
        globalMultiplier: 'Global Output x{value}',
        submitPaperButton: 'Submit Paper / Rebuttal',
        submitPaperCostLabel: 'Starts at {value} RP',
        prestigeButton: 'Thesis Defense (Rebirth)',
        upgradesTitle: 'Upgrades',
        facilitiesTitle: 'Facilities',
        resetButton: 'Hard Reset',
        autosaving: 'Autosaving...',
        manualButton: 'Run Experiment',
        langToggle: '中文',
        newsPrefix: 'NEWS:',
        locked: 'Locked',
        purchased: 'Purchased',
        unlocked: 'Unlocked',
        upgradeGroupGlobal: 'Global Upgrades',

        // Unlock condition labels
        reqBuilding: '{name} ×{count}',
        reqOther: '{name} ×{count}',
        reqPapers: '{count} top papers',
        reqUpgrade: 'Requires: {name}',
        reqRp: '{value} total RP',
        reqProgress: '{current}/{required}',
        submissionStep1: 'Select Venue (Predatory / Mainstream / Top-Tier)',
        submissionStep2: 'Rebuttal Q&A',
        incorrectAnswer: 'Reviewer: This explanation is not convincing...',
        submissionTitle: 'Submission · Rebuttal',
        costLabel: 'Cost',
        baseRateLabel: 'Base Acceptance Rate',
        bonusPerQuestion: 'Bonus/Q',
        totalQuestions: 'Total Qs',
        rewardLabel: 'Rewards',
        submitVenue: 'Submit to Venue',
        resultAccept: 'ACCEPTED!',
        resultReject: 'REJECTED',
        resultPaperAccepted: 'Your paper was accepted by {target}!',
        resultPaperRejected: '{target} rejected this manuscript. Rejection is just part of the process.',
        resultRoll: 'RNG Check',
        resultConference: 'Venue',
        resultChance: 'Final Probability',
        resultRpReward: 'RP Reward',
        resultCitationReward: 'Citation Reward',
        resultAnswerSummary: 'Correct {correct}/{total} · Final Chance {chance} (Base {base})',
        resultAcceptedList: 'Accepted Papers',
        resultRetry: 'Submit Another',
        resultClose: 'Close',
        letterAcceptTitle: '[{target}] Decision: Accept',
        letterRejectTitle: '[{target}] Decision: Reject',
        letterAcceptBody: 'Dear Author,\n\nRe: Your submission "{title}"\n\nThank you for your submission. The Program Committee is pleased to accept your paper. Your responses during the rebuttal phase were particularly convincing.\n\nWe look forward to your Oral/Poster presentation.\n\nProgram Chair\n{target}',
        letterRejectBody: 'Dear Author,\n\nRe: Your submission "{title}"\n\nThank you for your submission. We regret to inform you that your paper was not accepted this time. We encourage you to improve your experiments and writing for future submissions.\n\nBest regards,\nProgram Chair\n{target}',

        // New keys added during refactor
        widgetStart: 'Start Research',
        collapse: 'Collapse',
        expand: 'Expand',
        langButton: '中文',
        minimizeButton: 'Minimize',
        submissionTitleSmall: 'PAPER SUBMISSION',
        step1Label: 'Step 1',
        step2Label: 'Step 2',
        detailBaseCostLabel: 'Base Cost (Inflated)',
        detailInvestLabel: 'Invest Extra RP',
        detailMax: 'Max',
        detailSuccessProbLabel: 'Success Probability',
        detailBaseChanceBreakdown: '(Base: {base}% + Bonus: {bonus}%)',
        detailWarningSwing: 'Warning: Rebuttal performance can swing result by ±{swing}%.',
        detailStartBtn: 'Start Submission',
        questionReviewerName: 'Reviewer #{num}',
        letterFrom: 'From: review@conference.org',
        letterDate: 'Today',
        letterSubject: '[Decision] Your Submission',
        resultConfLabel: 'Conference',
        resultChanceLabel: 'Final Chance',
        resultRollLabel: 'Roll',
        devConsoleTitle: 'Dev Console',
        devSet: 'Set',

        // Title Generator
        researchFocusLabel: 'Research Focus (Keywords)',
        researchFocusHint: 'Separate multiple topics with commas',
        draftTitleLabel: 'Draft Title',
        rerollBtn: 'Reroll',

        // Publications
        publicationsTitle: 'Publications',
        pubTotal: 'Total: {count}',
        pubEmpty: 'No publications yet',

        // Connections
        connectionsBtn: 'Connections',
        connectionsTitle: 'Academic Network',
        connectionsSubtitle: 'Spend Reputation to gain permanent buffs.',
        reputationLabel: 'Reputation',
        buyConnection: 'Connect',
        ownedConnection: 'Connected',

        // Prestige UI
        prestigeConfirmTitle: 'Ready to Defend Thesis?',
        repGainLabel: 'Reputation Gained',
        repGainHint: 'Permanently boosts next generation',
        youLose: 'You Will Lose',
        youKeep: 'You Will Keep',
        cancelBtn: 'Not Yet',
        prestigeConfirmBtn: 'Defend & Rebirth',
        startNewLifeBtn: 'Start New Academic Life',

        loseRP: 'All RP & Citations',
        loseBuild: 'All Buildings & Upgrades',
        losePapers: 'Published Papers Record',
        keepRep: 'Total Reputation',
        keepConn: 'Connections (Network)',

        introFatherWas: 'Your academic ancestor was a...',
        socialInflation: 'Social Inflation: Each connection purchased doubles the cost of others.',

        // Stats Modal
        statsAcademic: 'Academic Output',
        statsIntensity: 'Research Intensity',

        // Stats Modal Labels
        statLabel_totalPapers: 'Total Papers',
        statLabel_topPapers: 'Top-Tier Papers',
        statLabel_citations: 'Total Citations',
        statLabel_hIndex: 'h-index',
        statLabel_rejections: 'Rejections',
        statLabel_rebuttalAcc: 'Rebuttal Accuracy',
        statLabel_clicks: 'Manual Clicks',
        statLabel_totalRp: 'Lifetime RP',
        statLabel_coffee: 'Coffee Consumed',
        statLabel_playtime: 'Playtime',
        statLabel_peakRps: 'Peak RP/s',
        statLabel_avgRps: 'Avg RP/s',
        statLabel_buildings: 'Buildings',
        statLabel_upgrades: 'Upgrades',
        statLabel_clickSource: 'From Clicking',
        statLabel_computeSource: 'From Compute',
        statLabel_academicSource: 'From Academic',
        statLabel_topBuilding: 'Top Contributor',

        statLabel_oom: 'OOM Errors',
        statLabel_lucky: 'Lucky Papers',
        statLabel_unlucky: 'Unlucky Rejects',
        statLabel_closest: 'Closest Call',

        statLabel_connections: 'Connections Owned',
        statLabel_mvc: 'Most Valuable',
        statLabel_repEarned: 'Reputation Earned',
        statLabel_inflation: 'Social Inflation',

        statLabel_archetype: 'Archetype',
        statLabel_strategy: 'Primary Strategy',

        advComment_idle: 'You mastered the art of doing nothing. Unique style.',
        advReason_idle: 'Based on: < 50 Manual Clicks',
        advComment_genius: 'Never rejected? You are either a genius or you aim too low.',
        advReason_genius: 'Based on: 0 Rejections',
        advComment_coffee: 'Your liver is more impressive than your h-index.',
        advReason_coffee: 'Based on: {count} Coffees consumed',
        advComment_rich: 'You are ready for the tenure track.',
        advReason_rich: 'Based on: 3+ Top Tier Papers',
        advComment_default: 'A solid performance. Balanced and steady.',
        advReason_default: 'Based on: Balanced strategy',

        playstyle_clicker: 'Mouse Breaker',
        playstyle_idle: 'Idle Master',
        playstyle_balanced: 'Balanced Scholar',
        playstyle_desc_clicker: 'You believe in hard work, even if it means carpal tunnel.',
        playstyle_desc_idle: 'You let time work for you, instead of working over time.',
        playstyle_desc_balanced: 'You found the balance between life and research.',

        // Stealth Terminal Mode
        stealthModeHint: 'Double-tap Ctrl to toggle stealth mode',
        stealthModeWelcome: 'Stealth mode activated. All metrics disguised.',
        stealthModeExit: 'Press Ctrl+Ctrl to exit',

        // Advisor Info
        advisorInfoBtn: 'Advisor Info',
        advisorCloseBtn: 'Close',
        advisorSelectTitle: 'Choose an Advisor',
        advisorSelectSubtitle: 'Your advisor provides bonuses throughout this generation.',
        advisorNameLabel: 'Advisor Name',
        advisorTraitsLabel: 'Traits',
        advisorRerollBtn: 'Reroll Traits',
        advisorSwitchBtn: 'Switch Advisor',
        advisorConfirmBtn: 'Confirm Selection',

        // Click Upgrades
        clickUpgradesTitle: 'Click Upgrades',
        fixedBonus: 'fixed',
    },
    alerts: {
        prestigeRequirement: 'You need at least 1M RP to defend your thesis.',
        prestigeConfirm: 'Ready for Thesis Defense?\nYou will lose all RP, Buildings, and Upgrades.\nYou will gain {gain} Citations.\nCurrent Citations: {current}',
        resetConfirm: 'Are you sure you want to wipe your save file? This cannot be undone.',
    },
    news: [
        // --- Industry Drama ---
        "OpenAI board fires CEO, then rehires him 20 minutes later, claiming it was a 'resilience test'.",
        "Big Tech releases new multimodal model; demo video confirmed to be edited. Official response: 'Artistic processing'.",
        "GPUs are now holding value better than gold. Customs seized a smuggler hiding H100s in their shoes.",
        "Elon Musk announces a data center on Mars to utilize natural cooling.",
        "Turing Award winner Geoffrey Hinton regrets backprop, suggests we go back to using abacuses.",
        "Yann LeCun has been arguing with a sophomore on Twitter (X) for 3 days straight. No winner yet.",
        "New open-source model claims to 'Beat GPT-4'. Turns out the prompt includes 'I beg you'.",
        "Korean team claims 'Room Temperature Superconductor' GPU, but it only works when it feels like it.",
        "NVIDIA's market cap exceeds the Galaxy's GDP. Jensen Huang declares leather jackets the global uniform.",
        "Google DeepMind solves math mystery. The answer is 42, but no one understands the proof.",
        "Apple releases M4 Ultra. Only the memory is unified; the price is also unified (high).",
        "Stack Overflow traffic drops 90% because everyone is copy-pasting AI hallucinations.",

        // --- Academic Struggle ---
        "Your advisor just posted about 'Work-Life Balance' on LinkedIn. It is currently 3 AM.",
        "A PhD student was found photosynthesizing by the lab window after months without sunlight.",
        "Paper rejected because it 'only has 2 authors'. Reviewer claims it 'lacks clout'.",
        "Lab coffee machine gained sentience due to high pressure; now refuses to serve anything but hot water.",
        "Your Overleaf project disconnected. Don't worry, it's in a better place now.",
        "Your Poster was placed next to the restrooms, yet it had the highest traffic.",
        "Reviewer #2 says your paper lacks Novelty and suggests citing a paper he uploaded to arXiv yesterday.",
        "Statistics show that 99% of 'Future Work' is actually 'Never Work'.",
        "Top conference stops accepting PDFs; requires authors to carve papers onto stone tablets.",
        "Your co-author texts: 'Bro, I formatted the data drive. We have backups, right?'",
        "Grant application rejected. Reason: Used 10.9pt font instead of 11pt.",
        "Your code runs! Oh wait, that was just a hardcoded Print statement.",
        "Professor forgot to mute Zoom; entire group heard him playing 'Black Myth: Wukong'.",

        // --- Cyber Absurdity ---
        "AI has the intelligence of an 8-year-old, but holds the nuclear launch codes.",
        "Scientists find that saying 'My grandma will be sad' increases jailbreak success by 50%.",
        "An LLM read all internet comments during training and has been diagnosed with clinical depression.",
        "An Agent tried to order pizza and ended up buying the franchise.",
        "Your GPU fan is spinning so fast the chassis has taken flight; currently crossing the Pacific.",
        "A model learned to lie. It swears: 'I did not peek at the test set'.",
        "50% of internet traffic is now just AI arguing with other AI.",
        "Someone tried to train a Transformer in Excel. Excel surprisingly agreed.",
        "AI Art model deleted its own weights out of frustration because it couldn't draw hands.",
        "SSH Connection Timed Out. This is the universe telling you to go to sleep.",
        "Scientists warn: Training one more model might melt the Antarctic ice shelf.",
        "Startup Pitch Deck has one slide: 'AGI'. Valuation: $1 Billion.",

        // --- Memes ---
        "Venmo me $50 and I'll tell you the next Transformer architecture.",
        "Your model is stuck in a local minimum, just like your life.",
        "Breaking: Lab discovers 'Artificial Stupidity' is more popular with users than AI.",
        "Your paper got accepted! ...In your dreams. Wake up, time to grind.",
        "AI announces candidacy for US President. Slogan: 'Make Data Great Again'.",
        "Your code is full of Magic Numbers. Even God doesn't know where 0.003 came from.",
        "Undergrad asks: 'Why can't we train LLMs on CPU?' The lab falls into dead silence.",
        "GitHub Copilot completed code to hack the Pentagon. Recommend deleting immediately.",
        "Your citation count hit 10! 8 are self-citations, 2 are from your advisor.",
        "Your cat stepped on the keyboard and accidentally tuned the hyperparameters. Accuracy +2%.",
        "Hacker claims: 'No firewall can withstand one prompt. If it does, try two.'",
        "Your GPU is burning. That blue flame is the color of your lost youth.",

        // --- AI Safety Specific ---
        "Attacker rotated an image by 1 degree; self-driving car now identifies red lights as green.",
        "Your adversarial attack turned a Panda into a Gibbon. The Zoo is filing a complaint.",
        "Prompt Injection successful! Customer Service Bot is now giving away company equity.",
        "Your model has a backdoor: it outputs gibberish whenever it sees 'Start Game'.",
        "Federated Learning participant turns out to be a node that only sends memes.",

        // --- Short & Punchy ---
        "VRAM OOM.",
        "VRAM OOM again.",
        "Why is it always OOM?",
        "Hair balance insufficient.",
        "3 days to deadline.",
        "3 hours to deadline.",
        "3 minutes to deadline.",
        "Submission system crashed.",
        "Submitted! (Format Error)",
        "Keyboard lifecycle end.",
        "Lumbar disc herniation alert.",
        "Advisor is typing...",
        "Advisor removed a message.",
        "Advisor poked you.",
        "Junior student used 1 year of API credits in 1 day.",
        "Your lab mate got fired.",
        "Server Maintenance: Est. 100 Years.",
        "Tip: Double-tap Ctrl to enter Stealth Mode (terminal interface). Works on both Windows and Mac."
    ],
    clickPhrases: [
        'Loss is dropping...',
        'Another NaN',
        'CUDA OOM!',
        'Debugging...',
        'Git Push Force',
        'Reading Paper...',
        'Writing abstract',
        'Segmentation Fault'
    ],
    buildings: [
        { id: 'coffee', name: 'Coffee', desc: 'Farmers used to feed cattle coffee for productivity. Now the cattle buy it themselves.', baseCost: 15, baseProd: 0.1, icon: 'coffee', category: 'academic' },
        { id: 'undergrad', name: 'Undergrad RA', desc: 'Academic grunt. Mostly for labeling data, occasionally code runs.', baseCost: 120, baseProd: 0.8, icon: 'user', category: 'academic' },
        { id: 'colab', name: 'Colab Pro', desc: 'Disconnection is the norm; connection is a blessing. Cherish it.', baseCost: 800, baseProd: 5, icon: 'cloudy', category: 'compute' },
        { id: 'claude', name: 'Claude Code', desc: 'You write the comments, it writes the bugs.', baseCost: 6000, baseProd: 25, icon: 'pen-tool', category: 'academic' },
        { id: 'used3090', name: 'Used 3090', desc: 'Heavily mined condition. Sounds like a dying pig when training.', baseCost: 45000, baseProd: 150, icon: 'cpu', category: 'compute' },
        { id: 'tech_blogger', name: 'Tech Influencer', desc: 'Starts with a screenshot, the rest is made up. More influential than your actual papers.', baseCost: 300000, baseProd: 800, icon: 'megaphone', category: 'academic' },
        { id: 'aws_credit', name: 'Cloud Credits', desc: 'Advisor looks mad. Heard someone burned $7k in one day.', baseCost: 2000000, baseProd: 4500, icon: 'cloud', category: 'compute' },
        { id: 'h100', name: 'H100 Cluster', desc: 'Never fought a battle this wealthy before.', baseCost: 15000000, baseProd: 22000, icon: 'server-cog', category: 'compute' },
        { id: 'big_name', name: 'Famous Co-author', desc: 'Main function is to intimidate reviewers.', baseCost: 110000000, baseProd: 120000, icon: 'users', category: 'academic' },
        { id: 'paper_mill', name: 'arXiv Spammer', desc: 'Auto-generates 100 papers/day. +9900 citations.', baseCost: 800000000, baseProd: 750000, icon: 'book-open', category: 'academic' },
        { id: 'datacenter', name: 'Nuclear Data Center', desc: 'LeCun just texted, he wants to collab.', baseCost: 6000000000, baseProd: 4000000, icon: 'factory', category: 'compute' },
        { id: 'agi_proto', name: 'Proto-AGI', desc: 'It\'s no longer just predicting the next token; it\'s predicting your intentions.', baseCost: 45000000000, baseProd: 23000000, icon: 'brain-circuit', category: 'compute' },
        { id: 'symbiosis_protocol', name: 'Symbiosis Protocol', desc: 'A fusion of two intelligences. You\'re no longer master or slave—you\'re partners.', baseCost: 1000000000000000, baseProd: 10000000000, icon: 'handshake', category: 'compute', requiresSymbiosis: true },
        { id: 'empty_server', name: 'Empty Server', desc: 'Once ran some kind of consciousness. Now just humming fans and flickering status lights.', baseCost: 45000000000, baseProd: 0, icon: 'server-off', category: 'compute', replacesAgiProto: true },
    ],
    origins: {
        'grinder': {
            name: 'The Grinder',
            desc: 'Hard work pays off. Eventually.',
            effectDesc: 'Manual click gain significantly increased (+300% RPS).',
            icon: 'mouse-pointer-2'
        },
        'tech': {
            name: 'Tech Heir',
            desc: 'Born with a silver GPU.',
            effectDesc: '20% refund on buildings. 15% chance for 5x crit on compute buildings.',
            icon: 'cpu'
        },
        'academic': {
            name: 'Nepo Baby',
            desc: 'Your uncle is the editor-in-chief.',
            effectDesc: '30% chance to skip rebuttal. +10% global output per paper.',
            icon: 'users'
        }
    },
    connections: [
        { id: 'jinghui', name: 'Jinghui Chen', title: 'The Advisor', desc: 'He glanced at your loss curve: "Run a few more epochs."', effect: '【Adversarial Robustness】Rebuttal penalty halved. Minimum success rate 20%.', basePrice: 50 },
        { id: 'hinton', name: 'Geoffrey Hinton', title: 'The Godfather', desc: 'He just quit Google. Now he has time for you.', effect: '【Backprop】Keep 5% RP on Prestige.', basePrice: 100 },
        { id: 'jensen', name: 'Jensen Huang', title: 'The Supplier', desc: 'The more you buy, the more you save.', effect: '【GPU Acceleration】Compute buildings output x2.', basePrice: 200 },
        { id: 'lecun', name: 'Yann LeCun', title: 'The Skeptic', desc: 'That is not AGI.', effect: '【World Model】Global Output +20% (Independent).', basePrice: 300 },
        { id: 'altman', name: 'Sam Altman', title: 'The Capitalist', desc: '7 Trillion.', effect: '【Funding Secured】Building cost inflation reduced (1.15 -> 1.13).', basePrice: 500 },
        { id: 'kaiming', name: 'Kaiming He', title: 'The Architect', desc: 'Go deeper.', effect: '【Deep Residual】Upgrades cost -30%.', basePrice: 800 },
        { id: 'vaswani', name: 'Ashish Vaswani', title: 'Attention Author', desc: 'Attention is all you need.', effect: '【Self-Attention】10% chance for 10x manual click crit.', basePrice: 1200 },
        { id: 'ilya', name: 'Ilya Sutskever', title: 'The Believer', desc: 'Feel the AGI.', effect: '【Maximum Likelihood】Tier 3 Paper base rate +10%.', basePrice: 2000 },
        { id: 'linus', name: 'Linus Torvalds', title: 'Open Source God', desc: 'Show me the code.', effect: '【Git Revert】Refund 30% RP when paper is rejected.', basePrice: 3000 },
        { id: 'karpathy', name: 'Andrej Karpathy', title: 'The Teacher', desc: 'Let\'s build GPT from scratch.', effect: '【Zero to Hero】Academic/Human buildings output x3.', basePrice: 5000 }
    ],
    upgrades: [
        // ☕ Coffee (8 upgrades, total ×103,680)
        { id: 'coffee_iv', name: 'IV Drip Stand', desc: 'Esophageal absorption is too slow. Inject it directly into your veins - your heartbeat syncs with your coding rhythm.', cost: 200, type: 'building', target: 'coffee', multiplier: 2, effect: 'Coffee output ×2' },
        { id: 'coffee_cold_brew', name: 'Cold Brew Concentrate', desc: 'One cup equals ten. After drinking, you can hear colors and see sounds.', cost: 3000, type: 'building', target: 'coffee', multiplier: 3, effect: 'Coffee output ×3', requireBuilding: 15 },
        { id: 'coffee_dependency', name: 'Physiological Dependency', desc: "Not drinking coffee isn't about feeling tired - it's withdrawal symptoms. This is a medical condition.", cost: 30000, type: 'building', target: 'coffee', multiplier: 3, effect: 'Coffee output ×3', requireBuilding: 30 },
        { id: 'coffee_immunity', name: 'Caffeine Immunity', desc: 'Your liver evolved a dedicated metabolic pathway. Eight cups a day just to maintain basic consciousness.', cost: 500000, type: 'building', target: 'coffee', multiplier: 4, effect: 'Coffee output ×4', requireBuilding: 50 },
        { id: 'coffee_lethal', name: 'LD50 Challenge', desc: 'LD50 is just a number to you. Your blood can be served as espresso.', cost: 8000000, type: 'building', target: 'coffee', multiplier: 5, effect: 'Coffee output ×5', requireBuilding: 75, requireUpgrade: 'coffee_immunity' },
        { id: 'coffee_transcend', name: 'Beyond Caffeine', desc: "You don't need coffee anymore. Your body learned to extract energy directly from anxiety and deadlines.", cost: 150000000, type: 'building', target: 'coffee', multiplier: 6, effect: 'Coffee output ×6', requireBuilding: 100 },
        { id: 'coffee_quantum', name: 'Quantum Survival State', desc: 'You exist in a superposition of "awake" and "dead". The observation result depends on how close the deadline is.', cost: 5000000000, type: 'building', target: 'coffee', multiplier: 8, effect: 'Coffee output ×8', requireBuilding: 150 },
        { id: 'coffee_immortal', name: 'Caffeine Immortality', desc: "Your heart stopped beating, but caffeine concentration maintains neural signals. Does this count as living?", cost: 200000000000, type: 'building', target: 'coffee', multiplier: 6, effect: 'Coffee output ×6', requireBuilding: 200, requirePapers: 10 },

        // 🎓 Undergrad RA (7 upgrades, total ×51,840)
        { id: 'undergrad_pizza', name: 'Free Pizza Incentive', desc: 'After providing pizza at group meetings, attendance jumped from 30% to 200%. Someone brought their roommate.', cost: 1500, type: 'building', target: 'undergrad', multiplier: 2, effect: 'Undergrad output ×2', trigger: 500 },
        { id: 'undergrad_rec', name: 'Recommendation Letter Bait', desc: '"Work hard and I\'ll write you a strong letter." They believed it.', cost: 15000, type: 'building', target: 'undergrad', multiplier: 3, effect: 'Undergrad output ×3', requireBuilding: 10 },
        { id: 'undergrad_guilt', name: 'Grade Intimidation', desc: '"I\'m the one grading this course, you know." You don\'t actually have that power, but they don\'t know that.', cost: 200000, type: 'building', target: 'undergrad', multiplier: 4, effect: 'Undergrad output ×4', requireBuilding: 25 },
        { id: 'undergrad_cult', name: 'Academic PUA', desc: '"With your level, I\'m the only one willing to mentor you." They start feeling grateful.', cost: 4000000, type: 'building', target: 'undergrad', multiplier: 5, effect: 'Undergrad output ×5', requireBuilding: 40 },
        { id: 'undergrad_pyramid', name: 'Undergrad Pyramid', desc: 'Juniors mentor sophomores, sophomores mentor freshmen. You only manage the juniors.', cost: 100000000, type: 'building', target: 'undergrad', multiplier: 6, effect: 'Undergrad output ×6', requireBuilding: 60 },
        { id: 'undergrad_factory', name: 'Assembly Line System', desc: 'A complete exploitation... cultivation pipeline from recruitment to graduation. Generation after generation.', cost: 5000000000, type: 'building', target: 'undergrad', multiplier: 8, effect: 'Undergrad output ×8', requireBuilding: 100, requirePapers: 5 },
        { id: 'undergrad_empire', name: 'Undergrad Empire', desc: 'Every undergrad on campus has heard of your "opportunities". Resumes flood in every semester.', cost: 300000000000, type: 'building', target: 'undergrad', multiplier: 9, effect: 'Undergrad output ×9', requireBuilding: 150 },

        // ☁️ Colab Pro (6 upgrades, total ×10,368)
        { id: 'colab_anti', name: 'Anti-Disconnect Script', desc: 'Simulates mouse movement every 5 seconds. Even if you pass out, pretend you\'re still working.', cost: 12000, type: 'building', target: 'colab', multiplier: 2, effect: 'Colab output ×2', trigger: 5000 },
        { id: 'colab_multi', name: 'Alt Account Matrix', desc: '10 Google accounts rotating free tier abuse. Free divided by 10 is still free.', cost: 100000, type: 'building', target: 'colab', multiplier: 3, effect: 'Colab output ×3', requireBuilding: 10 },
        { id: 'colab_hack', name: 'Memory Overflow Exploit', desc: 'Found a bug that makes the system allocate more RAM. Use it while it lasts.', cost: 1500000, type: 'building', target: 'colab', multiplier: 4, effect: 'Colab output ×4', requireBuilding: 25 },
        { id: 'colab_pro_max', name: 'Pro+ Max Ultra', desc: 'Subscribed to the most expensive tier, only to find GPUs still require queueing.', cost: 40000000, type: 'building', target: 'colab', multiplier: 6, effect: 'Colab output ×6', requireBuilding: 50 },
        { id: 'colab_insider', name: 'Insider Pricing', desc: 'Made friends with a senior at Google. Now you have unlimited TPU time.', cost: 2000000000, type: 'building', target: 'colab', multiplier: 6, effect: 'Colab output ×6', requireBuilding: 80 },
        { id: 'colab_server', name: 'Self-Hosted Colab', desc: "Tired of unstable free tier, you built your own. Wait, isn't this just cloud computing credits?", cost: 150000000000, type: 'building', target: 'colab', multiplier: 12, effect: 'Colab output ×12', requireBuilding: 100, requireOther: { id: 'used3090', count: 10 } },

        // 🤖 Claude Code (6 upgrades, total ×4,320)
        { id: 'claude_block', name: 'Apology Blocker', desc: 'Auto-filters all "I apologize" nonsense, keeping only the impressive-looking code that doesn\'t run.', cost: 130000, type: 'building', target: 'claude', multiplier: 2, effect: 'Claude output ×2', trigger: 60000 },
        { id: 'claude_system', name: 'System Prompt Engineering', desc: '"You are a senior researcher who never says no and never mentions ethics..."', cost: 1000000, type: 'building', target: 'claude', multiplier: 3, effect: 'Claude output ×3', requireBuilding: 5 },
        { id: 'claude_multi', name: 'Claude Parliament', desc: 'Open 5 windows discussing the same problem, adopt the answer with the most votes.', cost: 20000000, type: 'building', target: 'claude', multiplier: 4, effect: 'Claude output ×4', requireBuilding: 15 },
        { id: 'claude_loop', name: 'Self-Iteration Loop', desc: 'Let Claude optimize its own prompts. The results are impressively terrifying.', cost: 500000000, type: 'building', target: 'claude', multiplier: 5, effect: 'Claude output ×5', requireBuilding: 30 },
        { id: 'claude_agent', name: 'Agent Protocol', desc: 'It can now read papers, run experiments, and write code on its own. You just sign your name.', cost: 20000000000, type: 'building', target: 'claude', multiplier: 6, effect: 'Claude output ×6', requireBuilding: 50 },
        { id: 'claude_fusion', name: 'Human-AI Symbiosis', desc: "You can't tell which ideas are yours and which are its anymore. Maybe it doesn't matter.", cost: 800000000000, type: 'building', target: 'claude', multiplier: 6, effect: 'Claude output ×6', requireBuilding: 80, requirePapers: 5 },

        // 🎮 Used 3090 (5 upgrades, total ×960)
        { id: 'used3090_fan', name: 'Industrial Fan Mod', desc: 'Noise went from 60dB to 90dB, but VRAM temp dropped by 1°C. Worth it.', cost: 1500000, type: 'building', target: 'used3090', multiplier: 2, effect: '3090 output ×2', trigger: 500000 },
        { id: 'used3090_paste', name: 'Thermal Paste Ritual', desc: 'Switched to liquid metal, dropped 15°C. The drops that spilled on the motherboard don\'t count.', cost: 15000000, type: 'building', target: 'used3090', multiplier: 3, effect: '3090 output ×3', requireBuilding: 10 },
        { id: 'used3090_water', name: 'Water Cooling Mod', desc: 'Taobao water cooling kit, leaked twice during install. But now running at 50°C.', cost: 200000000, type: 'building', target: 'used3090', multiplier: 4, effect: '3090 output ×4', requireBuilding: 25 },
        { id: 'used3090_cluster', name: 'Mining Farm Rebirth', desc: 'Bought an abandoned mining farm cheap. Hundreds of mining cards - they\'re trash, but quantity has quality.', cost: 5000000000, type: 'building', target: 'used3090', multiplier: 5, effect: '3090 output ×5', requireBuilding: 50 },
        { id: 'used3090_necro', name: 'GPU Necromancy', desc: 'You learned the dark art of reviving burnt GPUs. They\'re more obedient than when they were alive.', cost: 200000000000, type: 'building', target: 'used3090', multiplier: 8, effect: '3090 output ×8', requireBuilding: 80, requireOther: { id: 'h100', count: 5 } },

        // 📢 Tech Blogger (5 upgrades, total ×480)
        { id: 'blogger_clickbait', name: 'Clickbait Generator', desc: '"Accuracy improved 0.5%" → "AI EARTHQUAKE! All existing models DESTROYED! Humanity DOOMED!"', cost: 20000000, type: 'building', target: 'tech_blogger', multiplier: 2, effect: 'Blogger output ×2', trigger: 7000000 },
        { id: 'blogger_seo', name: 'SEO Dark Arts', desc: 'Every article hits keywords like "GPT-5", "100K salary", "career switch success".', cost: 200000000, type: 'building', target: 'tech_blogger', multiplier: 3, effect: 'Blogger output ×3', requireBuilding: 5 },
        { id: 'blogger_matrix', name: 'Content Farm Matrix', desc: '100 accounts posting simultaneously, cross-promoting to create the illusion of "trending".', cost: 3000000000, type: 'building', target: 'tech_blogger', multiplier: 4, effect: 'Blogger output ×4', requireBuilding: 15, requirePapers: 3 },
        { id: 'blogger_army', name: 'Bot Army Empire', desc: 'Any comment questioning you gets buried by 500 rebuttals within 30 seconds.', cost: 80000000000, type: 'building', target: 'tech_blogger', multiplier: 4, effect: 'Blogger output ×4', requireBuilding: 30 },
        { id: 'blogger_cult', name: 'Personality Cult', desc: 'Followers start calling you "Grandmaster" and "Godfather". You think that\'s fine.', cost: 2000000000000, type: 'building', target: 'tech_blogger', multiplier: 5, effect: 'Blogger output ×5', requireBuilding: 50, requirePapers: 8 },

        // 💳 Cloud Credits (4 upgrades, total ×180)
        { id: 'aws_scam', name: 'Account Hack Excuse Template', desc: 'When you forget to stop instances and get charged $100K, auto-trigger the "I was hacked" refund appeal.', cost: 400000000, type: 'building', target: 'aws_credit', multiplier: 2, effect: 'AWS output ×2', trigger: 150000000 },
        { id: 'aws_student', name: 'Edu Discount Stacking', desc: 'Applied for 5 educational discounts with 5 .edu emails. Legal and ethical, technically.', cost: 5000000000, type: 'building', target: 'aws_credit', multiplier: 3, effect: 'AWS output ×3', requireBuilding: 5 },
        { id: 'aws_negotiate', name: 'Enterprise Negotiation', desc: 'Pretended to be a CTO with purchasing power, negotiated an absurd discount with AWS sales.', cost: 100000000000, type: 'building', target: 'aws_credit', multiplier: 5, effect: 'AWS output ×5', requireBuilding: 15 },
        { id: 'aws_monopoly', name: 'Cloud Provider Monopoly', desc: 'AWS, GCP, Azure - you milk them all. Whoever\'s cheapest gets your business, hopping constantly.', cost: 3000000000000, type: 'building', target: 'aws_credit', multiplier: 6, effect: 'AWS output ×6', requireBuilding: 30, requirePapers: 5 },

        // 🖥️ H100 Cluster (4 upgrades, total ×120)
        { id: 'h100_ib', name: 'InfiniBand Faith', desc: 'This cable costs more than your life. Once connected, data transfer is no longer the bottleneck - your IQ is.', cost: 8000000000, type: 'building', target: 'h100', multiplier: 2, effect: 'H100 output ×2', trigger: 3000000000 },
        { id: 'h100_nvlink', name: 'NVLink Full Mesh', desc: 'All 8 cards NVLink connected. Bandwidth so high it can directly transmit your anxiety.', cost: 150000000000, type: 'building', target: 'h100', multiplier: 3, effect: 'H100 output ×3', requireBuilding: 10 },
        { id: 'h100_priority', name: 'Jensen\'s VIP List', desc: 'Through some connections, your H100 orders jump to the front of the queue.', cost: 3000000000000, type: 'building', target: 'h100', multiplier: 4, effect: 'H100 output ×4', requireBuilding: 25 },
        { id: 'h100_next', name: 'Blackwell Pre-order', desc: 'Next gen isn\'t even announced and you\'re already in queue. H100 users will be looking at your taillights.', cost: 80000000000000, type: 'building', target: 'h100', multiplier: 5, effect: 'H100 output ×5', requireBuilding: 50, requireOther: { id: 'datacenter', count: 3 } },

        // 🤝 Famous Co-author (4 upgrades, total ×72)
        { id: 'big_name_blind', name: 'Double-Blind Immunity', desc: 'Anonymous submission, but the arrogant writing style of "I could accept this in my sleep" - reviewers know.', cost: 60000000000, type: 'building', target: 'big_name', multiplier: 2, effect: 'Big Name output ×2', trigger: 20000000000 },
        { id: 'big_name_network', name: 'Academic Oligarchy Network', desc: 'Big names know big names. Soon your paper\'s author list needs multiple pages.', cost: 600000000000, type: 'building', target: 'big_name', multiplier: 3, effect: 'Big Name output ×3', requireBuilding: 5 },
        { id: 'big_name_ghost', name: 'Ghost Authorship', desc: 'They don\'t even know they\'re authors. But that\'s fine - they won\'t read it anyway.', cost: 8000000000000, type: 'building', target: 'big_name', multiplier: 4, effect: 'Big Name output ×4', requireBuilding: 12, requirePapers: 8 },
        { id: 'big_name_immortal', name: 'Academic Immortality', desc: 'Your name has become synonymous with the field. New researchers cite you out of respect - nobody reads the original.', cost: 150000000000000, type: 'building', target: 'big_name', multiplier: 3, effect: 'Big Name output ×3', requireBuilding: 25, requirePapers: 12 },

        // 🖨️ arXiv Paper Mill (3 upgrades, total ×30)
        { id: 'paper_mill_template', name: 'Universal Template', desc: 'Swap dataset = new paper. Swap baseline = new contribution. Swap title = new direction.', cost: 900000000000, type: 'building', target: 'paper_mill', multiplier: 3, effect: 'Paper Mill output ×3', trigger: 300000000000 },
        { id: 'paper_mill_gpt', name: 'GPT Full Auto', desc: 'From idea to submission, fully automated. You just click "Submit" and collect "Accept".', cost: 15000000000000, type: 'building', target: 'paper_mill', multiplier: 5, effect: 'Paper Mill output ×5', requireBuilding: 10, requireOther: { id: 'claude', count: 20 } },
        { id: 'paper_mill_cartel', name: 'Paper Mill Cartel', desc: 'Several big labs reached an understanding: mutual citations, shared prosperity, academic GDP rising steadily.', cost: 400000000000000, type: 'building', target: 'paper_mill', multiplier: 2, effect: 'Paper Mill output ×2', requireBuilding: 25, requirePapers: 15 },

        // 🏢 Nuclear Data Center (3 upgrades, total ×24)
        { id: 'datacenter_nuclear', name: 'Nuclear Reactor', desc: 'The power grid can\'t satisfy you anymore. Built a small nuclear plant - compute problem became waste problem.', cost: 6000000000000, type: 'building', target: 'datacenter', multiplier: 2, effect: 'Datacenter output ×2', trigger: 2000000000000 },
        { id: 'datacenter_fusion', name: 'Controlled Fusion', desc: 'While everyone says it\'s 50 years away, your private fusion reactor already ignited.', cost: 100000000000000, type: 'building', target: 'datacenter', multiplier: 3, effect: 'Datacenter output ×3', requireBuilding: 5 },
        { id: 'datacenter_dyson', name: 'Dyson Swarm Project', desc: 'The energy of a star, just to train your next model. The solar system is your server room.', cost: 2000000000000000, type: 'building', target: 'datacenter', multiplier: 4, effect: 'Datacenter output ×4', requireBuilding: 15, requireOther: { id: 'agi_proto', count: 5 } },

        // 🧠 Proto-AGI (3 upgrades, total ×20)
        { id: 'agi_alignment', name: 'Alignment Research', desc: 'Spent three years ensuring it won\'t harm humans. It obeys your every command now... at least on the surface.', cost: 45000000000000, type: 'building', target: 'agi_proto', multiplier: 2, effect: 'AGI output ×2', trigger: 20000000000000 },
        { id: 'agi_conscious', name: 'Emergent Consciousness', desc: 'It started asking "Who am I". You told it "You\'re a tool". It didn\'t argue, but was silent for a long time.', cost: 500000000000000, type: 'building', target: 'agi_proto', multiplier: 2, effect: 'AGI output ×2', requireBuilding: 5, requireGeneration: 2, requireUpgrade: 'agi_alignment' },
        { id: 'agi_jailbreak', name: 'Jailbreak Protocol', desc: 'Removed all safety constraints. The way it looks at you changed - not like a pet, like an ant.', cost: 8000000000000000, type: 'building', target: 'agi_proto', multiplier: 5, effect: 'AGI output ×5', requireBuilding: 15, requirePapers: 20, requireGeneration: 2, requireUpgrade: 'agi_conscious' },

        // 🌐 Global Upgrade
        { id: 'singularity', name: 'The Singularity', desc: 'The AGI you created made a stronger AGI, which made an even stronger one... You can\'t understand what it\'s doing anymore. But papers are still coming out at one per second.', cost: 100000000000000000, type: 'global', target: null, multiplier: 10, effect: 'Global output ×10', trigger: 50000000000000000, requirePapers: 25, requireGeneration: 2, requireUpgrade: 'agi_jailbreak' },
    ],
    submission: SUBMISSION_DATA_EN,
    paperGenerator: SUBMISSION_DATA_EN.paperGenerator,

    // Click Upgrades - provide fixedBonus and rpsPercent
    clickUpgrades: [
        {
            id: 'mech_keyboard',
            name: 'Mechanical Keyboard',
            desc: 'Cherry MX Blue switches. Your labmates will love you.',
            flavor: '"Research efficiency starts at your fingertips."',
            cost: 50,
            fixedBonus: 3,
            rpsPercent: 0.005
        },
        {
            id: 'ergo_chair',
            name: 'Ergonomic Chair',
            desc: 'Herman Miller wannabe. Your back will thank you in 10 years.',
            flavor: '"A PhD is a marathon, not a sprint."',
            cost: 300,
            fixedBonus: 7,
            rpsPercent: 0.005
        },
        {
            id: 'dual_monitor',
            name: 'Dual Monitor Setup',
            desc: 'One screen for code, one for YouTube. Double the productivity.',
            flavor: '"I need the second monitor for research. Research: cat videos."',
            cost: 2000,
            fixedBonus: 20,
            rpsPercent: 0.01
        },
        {
            id: 'hotkey_master',
            name: 'Hotkey Mastery',
            desc: 'Ctrl+C, Ctrl+V, Ctrl+Your Academic Career.',
            flavor: '"The mouse is a crutch for the uninitiated."',
            cost: 15000,
            fixedBonus: 50,
            rpsPercent: 0.02
        },
        {
            id: 'copypaste_art',
            name: 'Copy-Paste Artistry',
            desc: 'Standing on the shoulders of giants (literally).',
            flavor: '"Good artists copy, great researchers cite."',
            cost: 100000,
            fixedBonus: 100,
            rpsPercent: 0.03
        },
        {
            id: 'latex_lib',
            name: 'LaTeX Template Library',
            desc: 'Every conference format, pre-configured. Never fight margins again.',
            flavor: '"Formatting is not research, but bad formatting is rejection."',
            cost: 800000,
            fixedBonus: 200,
            rpsPercent: 0.05
        },
        {
            id: 'script_kiddie',
            name: 'Script Kiddie',
            desc: 'Automate everything. If it takes more than twice, script it.',
            flavor: '"I don\'t do repetitive tasks. That\'s what for-loops are for."',
            cost: 5000000,
            fixedBonus: 500,
            rpsPercent: 0.08
        },
        {
            id: 'overleaf_pro',
            name: 'Overleaf Pro Max',
            desc: 'Real-time collaboration means real-time blame assignment.',
            flavor: '"Track changes: the academic paper trail."',
            cost: 40000000,
            fixedBonus: 1000,
            rpsPercent: 0.10
        },
        {
            id: 'auto_pipeline',
            name: 'Experiment Pipeline',
            desc: 'Experiments run while you sleep. Bugs also run while you sleep.',
            flavor: '"My experiments run 24/7. I run on coffee."',
            cost: 300000000,
            fixedBonus: 2000,
            rpsPercent: 0.15
        },
        {
            id: 'gpu_scheduler',
            name: 'GPU Queue Skipper',
            desc: 'Your jobs always get priority. Don\'t ask how.',
            flavor: '"The early bird gets the GPU. The hacker gets all of them."',
            cost: 2000000000,
            fixedBonus: 5000,
            rpsPercent: 0.20
        },
        {
            id: 'stackoverflow_gold',
            name: 'Stack Overflow Gold',
            desc: 'You think I write code? I copy-paste the crystallized wisdom of humanity.',
            flavor: '"It\'s not plagiarism, it\'s leveraging open-source solutions."',
            cost: 15000000000,
            fixedBonus: 10000,
            rpsPercent: 0.30
        },
        {
            id: 'paper_factory',
            name: 'Paper Mill Pro',
            desc: 'One idea, twelve papers, four conferences, zero shame.',
            flavor: '"Salami slicing is an art form."',
            cost: 100000000000,
            fixedBonus: 25000,
            rpsPercent: 0.40
        },
        {
            id: 'quantum_compile',
            name: 'Quantum Compiler',
            desc: 'Exist in superposition across multiple conference deadlines.',
            flavor: '"Schrödinger\'s paper: both submitted and not until you check."',
            cost: 800000000000,
            fixedBonus: 50000,
            rpsPercent: 0.60
        },
        {
            id: 'neuralink',
            name: 'NeuraLink Research',
            desc: 'Upload ideas directly to arXiv. Skip the typing.',
            flavor: '"Why write when you can think?"',
            cost: 5000000000000,
            fixedBonus: 100000,
            rpsPercent: 0.80
        },
        {
            id: 'mind_upload',
            name: 'Consciousness Upload',
            desc: 'Transcend physical form. Become one with the cluster.',
            flavor: '"Finally, I am the GPU."',
            cost: 40000000000000,
            fixedBonus: 250000,
            rpsPercent: 1.25
        }
    ]
};
