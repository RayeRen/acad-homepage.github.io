/**
 * Stealth Terminal Mode UI Module
 * Provides a terminal interface that disguises the game as a development environment.
 * Extracted from Game.UI.Stealth in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';
import { t, formatNumber, pickRandom } from '../data.js';

/**
 * Stealth mode state.
 */
let isActive = false;
let lastCtrlTime = 0;
let commandHistory = [];
let historyIndex = -1;
let updateInterval = null;
let clickListenerSetup = false;
let watchInterval = null;
let watchCommand = null;
let fakeLogEnabled = false;
let fakeLogInterval = null;
let fakeLogPaused = false;
let sessionStartTime = Date.now();
let logicAdapter = null;

/**
 * Submission flow state machine for terminal mode.
 */
const submission = {
    active: false,
    stage: null,        // 'tier' | 'invest' | 'confirm' | 'question' | 'result'
    selectedTier: null,
    investment: 0,
    questions: [],
    currentQ: 0,
    currentChance: 0,
    answers: [],
    targetVenue: null,
    advanceTimer: null
};

/**
 * Data mapping from game terms to terminal process names.
 */
const processNames = {
    coffee: 'caffeine_daemon',
    undergrad: 'intern_worker',
    colab: 'cloud_instance',
    claude: 'ai_assistant',
    collab: 'senior_dev',
    gpu_3090: 'cuda_core_3090',
    gpu_h100: 'cuda_core_h100',
    compute_cluster: 'hpc_cluster',
    agi_proto: 'neural_engine',
    quantum_sim: 'quantum_sim',
    neuro_link: 'bci_interface',
    galaxy_brain: 'superintelligence'
};

/**
 * Fake system processes to mix with game buildings.
 */
const fakeProcesses = [
    { pid: 1, user: 'root', cmd: 'systemd', baseCpu: 0.1, baseMem: 0.5 },
    { pid: 238, user: 'root', cmd: 'NetworkManager', baseCpu: 0.3, baseMem: 0.2 },
    { pid: 412, user: 'research', cmd: 'sshd', baseCpu: 0.1, baseMem: 0.1 },
    { pid: 567, user: 'research', cmd: 'code-server', baseCpu: 1.2, baseMem: 0.8 },
    { pid: 891, user: 'research', cmd: 'tmux: server', baseCpu: 0.5, baseMem: 0.3 },
    { pid: 1024, user: 'root', cmd: 'dockerd', baseCpu: 0.2, baseMem: 0.4 },
    { pid: 1256, user: 'research', cmd: 'jupyter-lab', baseCpu: 0.8, baseMem: 0.6 }
];

/**
 * Fake invalid command outputs.
 */
const fakeInvalidOutputs = [
    'bash: {cmd}: command not found',
    '[gcc] error: undefined reference to \'{cmd}\'',
    'make: *** No rule to make target \'{cmd}\'. Stop.',
    'python: can\'t open file \'{cmd}\': [Errno 2] No such file or directory',
    'npm ERR! 404 Not Found - GET https://registry.npmjs.org/{cmd}',
    'E: Unable to locate package {cmd}',
    'error: pathspec \'{cmd}\' did not match any file(s) known to git',
    'curl: (6) Could not resolve host: {cmd}'
];

/**
 * Fake log templates for background activity.
 */
const fakeLogTemplates = [
    '[build] Compiling module transformer_v4.2...',
    '[build] Linking shared library libcuda.so.530.41',
    '[gcc]   src/attention.c -> obj/attention.o',
    '[node]  Building frontend assets...',
    '[pip]   Installing dependencies from requirements.txt',
    '[test]  Running unit tests... 847/1203 passed',
    '[git]   Fetching origin/main...',
    '[docker] Building image research-env:latest...',
    '[nvcc]  Compiling CUDA kernel attention_forward.cu',
    '[python] Running train.py --epochs 100',
    '[wget]  Downloading pretrained weights... 45%',
    '[rsync] Syncing to remote server...',
    '[conda] Resolving environment...',
    '[pytest] test_model.py::test_forward PASSED',
    '[webpack] Hash: a3f2b1c4d5e6f7',
    '[nvidia-smi] GPU 0: 78C, 95% util',
    '[tensorboard] Serving on localhost:6006',
    '[jupyter] Kernel started: python3',
    '[wandb] Syncing run: experiment-042',
    '[kubectl] Pods: 3 running, 0 pending'
];

/**
 * Command list for tab auto-completion.
 */
const commandList = [
    'help', 'status', 'stat', 'ps', 'top', 'htop', 'buy', 'spawn',
    'upgrade', 'git', 'deploy', 'gc', 'clear', 'cls', 'exit', 'quit',
    'ls', 'kill', 'apt', 'catalog', 'systemctl', 'whoami', 'pwd',
    'date', 'uname', 'free', 'df', 'neofetch', 'man', 'sudo', 'cd',
    'cat', 'vim', 'nano', 'watch', 'verbose', 'log'
];

/**
 * Toggle stealth mode on/off.
 */
export function toggle() {
    if (isActive) {
        hide();
    } else {
        show();
    }
}

/**
 * Show the stealth terminal.
 */
export function show() {
    if (!DOM.stealthTerminal) return;

    isActive = true;
    sessionStartTime = Date.now();
    DOM.stealthTerminal.classList.remove('hidden');

    if (DOM.terminalCmd) {
        DOM.terminalCmd.focus();
    }

    // Start update loop
    updateInterval = setInterval(() => {
        renderTopDisplay();
    }, 1000);

    renderTopDisplay();
    updateTime();

    appendOutput('Stealth mode activated. All metrics disguised.', 'success');

    if (fakeLogEnabled) {
        startFakeLog();
    }

    if (!clickListenerSetup) {
        setupClickListener(logicAdapter);
        clickListenerSetup = true;
    }
}

/**
 * Hide the stealth terminal.
 */
export function hide() {
    if (!DOM.stealthTerminal) return;

    isActive = false;
    DOM.stealthTerminal.classList.add('hidden');

    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    stopFakeLog();

    if (submission.advanceTimer) {
        clearTimeout(submission.advanceTimer);
        submission.advanceTimer = null;
    }
    // The domain session remains persisted. Hiding the terminal pauses only
    // this adapter, and `git push` resumes from the canonical status.
    submission.active = false;
    submission.stage = null;
}

/**
 * Check if stealth mode is active.
 * @returns {boolean}
 */
export function isStealthActive() {
    return isActive;
}

/**
 * Update the terminal time display.
 */
function updateTime() {
    if (DOM.terminalTime) {
        const now = new Date();
        DOM.terminalTime.textContent = now.toLocaleTimeString();
    }
}

/**
 * Render the top-style process display.
 * @param {Object} Logic - Logic module for calculations
 */
export function renderTopDisplay(Logic) {
    if (!DOM.topDisplay) return;

    const { rp, inventory } = State;
    const { rps, buildingsConfig, globalMultiplier } = Runtime;

    updateTime();

    // Calculate system stats
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

    // Uptime
    const uptimeMs = Date.now() - sessionStartTime;
    const uptimeDays = Math.floor(uptimeMs / 86400000);
    const uptimeHours = Math.floor((uptimeMs % 86400000) / 3600000);
    const uptimeMins = Math.floor((uptimeMs % 3600000) / 60000);
    const uptimeStr = uptimeDays > 0
        ? `${uptimeDays} day${uptimeDays > 1 ? 's' : ''}, ${uptimeHours}:${String(uptimeMins).padStart(2, '0')}`
        : `${uptimeHours}:${String(uptimeMins).padStart(2, '0')}`;

    // Load average based on RPS
    const load1 = Math.max(0.01, rps / 1000).toFixed(2);
    const load5 = Math.max(0.01, rps / 1200).toFixed(2);
    const load15 = Math.max(0.01, rps / 1500).toFixed(2);

    // Tasks count
    const totalBuildings = Object.values(inventory).reduce((a, b) => a + b, 0);
    const runningTypes = Object.values(inventory).filter(v => v > 0).length;
    const totalTasks = 120 + totalBuildings + fakeProcesses.length;
    const runningCount = Math.max(1, runningTypes) + 1;

    // CPU stats
    const cpuUs = (35 + Math.random() * 35).toFixed(1);
    const cpuSy = (2 + Math.random() * 3).toFixed(1);
    const cpuId = (100 - parseFloat(cpuUs) - parseFloat(cpuSy) - 1).toFixed(1);

    // Memory
    const maxMem = 16000;
    const usedMem = Math.min(maxMem * 0.95, (rp / 10000000) * maxMem + 2000);
    const freeMem = maxMem - usedMem;

    // Swap
    const swapTotal = 8000;
    const swapUsed = 800 + Math.random() * 500;
    const swapFree = swapTotal - swapUsed;

    // Build output
    let output = '';
    output += `top - ${timeStr} up ${uptimeStr},  1 user,  load average: ${load1}, ${load5}, ${load15}\n`;
    output += `Tasks: ${totalTasks} total,   ${runningCount} running, ${totalTasks - runningCount} sleeping,   0 stopped,   0 zombie\n`;
    output += `%Cpu(s): ${cpuUs} us, ${cpuSy} sy,  0.0 ni, ${cpuId} id,  0.5 wa,  0.0 hi,  0.0 si,  0.0 st\n`;
    output += `MiB Mem :  ${maxMem.toFixed(1)} total,  ${freeMem.toFixed(1)} free,  ${usedMem.toFixed(1)} used,      0.0 buff/cache\n`;
    output += `MiB Swap:  ${swapTotal.toFixed(1)} total,  ${swapFree.toFixed(1)} free,   ${swapUsed.toFixed(1)} used.  ${(freeMem * 0.8).toFixed(1)} avail Mem\n`;
    output += '\n';
    output += '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n';

    // Build game processes
    const gameProcs = [];
    let gamePid = 100;

    if (buildingsConfig && Logic) {
        buildingsConfig.forEach(b => {
            const count = inventory[b.id] || 0;
            if (count === 0) return;

            const mult = Logic.getBuildingMultiplier(b.id) * globalMultiplier;
            const rate = b.baseProd * mult * count;
            const cpuPct = Math.min(99, (rate / (rps + 1)) * 100);
            const memPct = cpuPct * 0.8;
            const procName = processNames[b.id] || b.id;

            const virt = (count * 256 + Math.random() * 100).toFixed(0) + 'm';
            const res = (count * 128 + Math.random() * 50).toFixed(0) + 'm';
            const shr = (count * 32 + Math.random() * 20).toFixed(0) + 'm';
            const timeMin = Math.floor(Math.random() * 60);
            const timeSec = (Math.random() * 60).toFixed(2);

            gameProcs.push({
                pid: gamePid++,
                user: 'research',
                pr: 20,
                ni: 0,
                virt,
                res,
                shr,
                state: 'S',
                cpu: cpuPct,
                mem: memPct,
                time: `${timeMin}:${timeSec.padStart(5, '0')}`,
                cmd: procName
            });
        });
    }

    // Build fake system processes
    const sysProcs = fakeProcesses.map(fp => ({
        pid: fp.pid,
        user: fp.user,
        pr: 20,
        ni: 0,
        virt: (64 + Math.random() * 100).toFixed(0) + 'm',
        res: (32 + Math.random() * 50).toFixed(0) + 'm',
        shr: (16 + Math.random() * 20).toFixed(0) + 'm',
        state: 'S',
        cpu: fp.baseCpu + Math.random() * 0.5,
        mem: fp.baseMem + Math.random() * 0.3,
        time: `${Math.floor(Math.random() * 10)}:${(Math.random() * 60).toFixed(2).padStart(5, '0')}`,
        cmd: fp.cmd
    }));

    // Merge and sort
    const allProcs = [...gameProcs, ...sysProcs];
    allProcs.sort((a, b) => b.cpu - a.cpu);

    // Format each process line
    allProcs.forEach(p => {
        const pidStr = String(p.pid).padStart(5);
        const userStr = p.user.padEnd(9);
        const prStr = String(p.pr).padStart(3);
        const niStr = String(p.ni).padStart(4);
        const virtStr = p.virt.padStart(7);
        const resStr = p.res.padStart(7);
        const shrStr = p.shr.padStart(6);
        const cpuStr = p.cpu.toFixed(1).padStart(5);
        const memStr = p.mem.toFixed(1).padStart(5);
        const timeStr = p.time.padStart(9);

        output += `${pidStr} ${userStr} ${prStr} ${niStr} ${virtStr} ${resStr} ${shrStr} ${p.state} ${cpuStr} ${memStr} ${timeStr} ${p.cmd}\n`;
    });

    DOM.topDisplay.textContent = output;

    renderNvidiaSmi(Logic);
}

/**
 * Render the nvidia-smi style GPU display.
 * @param {Object} Logic - Logic module for calculations
 */
function renderNvidiaSmi(Logic) {
    if (!DOM.nvidiaSmiDisplay) return;

    const { rp, inventory } = State;
    const { rps, buildingsConfig, globalMultiplier } = Runtime;

    const gpuUtil = Math.min(99, Math.floor(40 + Math.random() * 40 + rps / 500));
    const memTotal = 24564;
    const memUsed = Math.min(23000, Math.floor((rp / 5000000) * 24000 + 1000));
    const temp = Math.floor(40 + Math.random() * 30);
    const power = Math.floor(100 + Math.random() * 200);
    const fan = Math.floor(20 + (temp - 40) * 2);
    const perf = gpuUtil > 70 ? 'P0' : (gpuUtil > 40 ? 'P2' : 'P8');

    const row = (s) => `|${s.padEnd(47)}|\n`;

    let output = '';
    output += '+-----------------------------------------------+\n';
    output += row(' NVIDIA-SMI 535.104.05   CUDA Version: 12.2');
    output += '|-----------------------------------------------|\n';
    output += row(' GPU: NVIDIA RTX 4090      Persistence-M: Off');
    output += row(` Fan: ${String(fan).padStart(2)}%  Temp: ${String(temp).padStart(2)}C  Perf: ${perf}  Pwr: ${String(power).padStart(3)}W/450W`);
    output += row(` Memory: ${String(memUsed).padStart(5)}MiB / ${memTotal}MiB`);
    output += row(` GPU-Util: ${String(gpuUtil).padStart(2)}%   Compute M.: Default`);
    output += '+-----------------------------------------------+\n';
    output += row(' Processes:');
    output += row('  PID  Type  Process              GPU Memory');
    output += '|===============================================|\n';

    let pid = 100;
    let procCount = 0;

    if (buildingsConfig && Logic) {
        buildingsConfig.forEach(b => {
            const count = inventory[b.id] || 0;
            if (count === 0) return;
            if (procCount >= 4) return;

            const mult = Logic.getBuildingMultiplier(b.id) * globalMultiplier;
            const rate = b.baseProd * mult * count;
            const gpuMem = Math.floor((rate / (rps + 1)) * memUsed * 0.8);
            const procName = (processNames[b.id] || b.id).substring(0, 18);

            output += row(`  ${String(pid).padStart(3)}     C  ${procName.padEnd(18)} ${String(gpuMem).padStart(5)}MiB`);
            pid++;
            procCount++;
        });
    }

    if (procCount < 4 && procCount > 0) {
        const fakeMem = Math.floor(memUsed * 0.2);
        output += row(`  567     C  python train.py      ${String(fakeMem).padStart(5)}MiB`);
    }

    if (procCount === 0) {
        output += row('  No running processes found');
    }

    output += '+-----------------------------------------------+\n';

    DOM.nvidiaSmiDisplay.textContent = output;
}

/**
 * Append output to the terminal.
 * @param {string} text - Text to append
 * @param {string} type - Output type ('info', 'success', 'error', 'warning', 'prompt', 'number', 'highlight')
 */
export function appendOutput(text, type = 'info') {
    const output = DOM.terminalOutput;
    if (!output) return;

    const line = document.createElement('div');
    line.className = `terminal-${type}`;
    line.textContent = text;
    output.appendChild(line);

    output.scrollTop = output.scrollHeight;

    while (output.children.length > 100) {
        output.removeChild(output.firstChild);
    }
}

/**
 * Execute a terminal command.
 * @param {string} cmd - Command to execute
 * @param {Object} Logic - Logic module for game operations
 * @param {boolean} silent - Whether to suppress command echo
 */
export function processCommand(cmd, Logic, silent = false) {
    if (submission.active) {
        handleSubmissionInput(cmd.trim(), Logic);
        return;
    }

    const parts = cmd.trim().toLowerCase().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    if (!silent) {
        appendOutput(`$ ${cmd}`, 'prompt');
    }

    if (cmd.trim() && !silent) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
    }

    switch (command) {
        case 'help':
            cmdHelp();
            break;
        case 'status':
        case 'stat':
            cmdStatus();
            break;
        case 'ps':
        case 'top':
        case 'htop':
            cmdPs(Logic);
            break;
        case 'buy':
        case 'spawn':
            cmdBuy(args, Logic);
            break;
        case 'upgrade':
            cmdUpgrade(args, Logic);
            break;
        case 'git':
            if (args[0] === 'push') {
                cmdGitPush(Logic);
            } else if (args[0] === 'reflog') {
                void cmdGitReflog();
            } else if (args[0] === 'reset' && args[1] === '--hard') {
                void cmdGitReset(args[2], Logic);
            } else {
                appendOutput(`git: '${args[0]}' is not a git command.`, 'error');
            }
            break;
        case 'deploy':
            cmdGitPush(Logic);
            break;
        case 'gc':
            if (args[0] === '--full') {
                cmdPrestige(Logic);
            } else {
                appendOutput('Usage: gc --full (performs full garbage collection)', 'info');
            }
            break;
        case 'clear':
        case 'cls':
            cmdClear();
            break;
        case 'exit':
        case 'quit':
            hide();
            break;
        case 'ls':
            cmdLs(Logic);
            break;
        case 'kill':
            appendOutput('kill: Operation not permitted. Processes are essential.', 'error');
            break;
        case 'apt':
            if (args[0] === 'list' || args[0] === 'search') {
                cmdAptList(Logic);
            } else if (args[0] === 'install') {
                cmdBuy(args.slice(1), Logic);
            } else {
                appendOutput('Usage: apt list | apt install <package>', 'info');
            }
            break;
        case 'catalog':
            cmdAptList(Logic);
            break;
        case 'whoami':
            appendOutput('researcher', 'success');
            break;
        case 'pwd':
            appendOutput('/home/researcher/project', 'info');
            break;
        case 'date':
            appendOutput(new Date().toString(), 'info');
            break;
        case 'uname':
            appendOutput('Linux workstation 6.2.0-39-generic #40-Ubuntu SMP x86_64 GNU/Linux', 'info');
            break;
        case 'free':
            cmdFree();
            break;
        case 'df':
            cmdDf();
            break;
        case 'neofetch':
            cmdNeofetch();
            break;
        case 'sudo':
            appendOutput('researcher is not in the sudoers file. This incident will be reported.', 'error');
            break;
        case 'cd':
            appendOutput('', 'info');
            break;
        case 'watch':
            cmdWatch(args, Logic);
            break;
        case 'verbose':
        case 'log':
            cmdVerbose(args);
            break;
        default:
            if (command) {
                const template = fakeInvalidOutputs[Math.floor(Math.random() * fakeInvalidOutputs.length)];
                const output = template.replace(/\{cmd\}/g, command);
                appendOutput(output, 'error');
            }
    }
}

// Command implementations
function cmdHelp() {
    const help = [
        '', 'Available commands:', '',
        '  Process Management:',
        '    ps/top/htop   - List running processes',
        '    apt list      - List available packages',
        '    apt install   - Install a package',
        '    buy <id>      - Spawn a new process',
        '    upgrade       - List available upgrades', '',
        '  System Info:',
        '    status        - Display system status',
        '    whoami/pwd    - User info',
        '    free/df       - Memory/disk usage',
        '    neofetch      - System info', '',
        '  Actions:',
        '    git push      - Submit for review',
        '    gc --full     - Full garbage collection (prestige)', '',
        '  Other:',
        '    ls            - List process types',
        '    watch [-n s]  - Run command periodically',
        '    verbose       - Toggle auto log',
        '    clear/exit    - Clear/exit terminal', ''
    ];
    help.forEach(line => appendOutput(line, 'info'));
}

function cmdStatus() {
    const { rp, citations, acceptedPapers, reputation, generation, citationsRate } = State;
    const { rps } = Runtime;
    const lines = [
        '', '=== System Status ===',
        `heap_memory:     ${formatNumber(rp)}`,
        `alloc_rate:      +${formatNumber(rps)}/s`,
        `downstream_deps: ${formatNumber(citations)} (+${formatNumber(citationsRate)}/s)`,
        `commits:         ${acceptedPapers.length}`,
        `reputation:      ${reputation}`,
        `generation:      ${generation}`, ''
    ];
    lines.forEach(line => appendOutput(line, 'info'));
}

function cmdPs(Logic) {
    appendOutput('USER       PID %CPU %MEM COMMAND', 'info');

    const { inventory } = State;
    const { globalMultiplier, buildingsConfig, rps } = Runtime;

    let pid = 100;
    let hasProcs = false;

    if (buildingsConfig && Logic) {
        buildingsConfig.forEach(b => {
            const count = inventory[b.id] || 0;
            if (count === 0) return;
            hasProcs = true;

            const mult = Logic.getBuildingMultiplier(b.id) * globalMultiplier;
            const rate = b.baseProd * mult * count;
            const cpuPct = Math.min(99, (rate / (rps + 1)) * 100).toFixed(1);
            const memPct = (cpuPct * 0.8).toFixed(1);
            const procName = processNames[b.id] || b.id;

            appendOutput(
                `research ${String(pid).padStart(5)} ${cpuPct.padStart(4)} ${memPct.padStart(4)} ${procName}`,
                'success'
            );
            pid++;
        });
    }

    if (!hasProcs) {
        appendOutput('(no user processes)', 'warning');
    }
}

function cmdLs(Logic) {
    const { buildingsConfig } = Runtime;
    const { inventory, rp } = State;

    const visibleCount = Math.min(
        buildingsConfig.length,
        Object.values(inventory).filter(v => v > 0).length + 2
    );

    appendOutput('', 'info');
    appendOutput('Available process types:', 'info');
    appendOutput('', 'info');

    buildingsConfig.forEach((b, idx) => {
        if (idx >= visibleCount) return;
        const count = inventory[b.id] || 0;
        const cost = Logic.calculateCost(b.baseCost, count);
        const canAfford = rp >= cost;
        const procName = processNames[b.id] || b.id;

        const status = canAfford ? '[AVAILABLE]' : '[LOCKED]';
        const type = canAfford ? 'success' : 'error';

        appendOutput(
            `  ${procName.padEnd(20)} Cost: ${formatNumber(cost).padStart(10)}  ${status}`,
            type
        );
    });
    appendOutput('', 'info');
}

function cmdBuy(args, Logic) {
    if (!args.length) {
        appendOutput('Usage: buy <process_name> [count]', 'warning');
        appendOutput("Type 'ls' to see available processes.", 'info');
        return;
    }

    const processName = args[0];
    const count = parseInt(args[1]) || 1;
    const { buildingsConfig } = Runtime;

    let building = null;
    const pidNum = parseInt(processName);
    if (!isNaN(pidNum) && pidNum >= 1 && pidNum <= buildingsConfig.length) {
        building = buildingsConfig[pidNum - 1];
    } else {
        for (const b of buildingsConfig) {
            const termName = processNames[b.id] || b.id;
            if (termName.toLowerCase() === processName.toLowerCase() ||
                b.id.toLowerCase() === processName.toLowerCase()) {
                building = b;
                break;
            }
        }
    }

    if (!building) {
        appendOutput(`E: Unable to locate package ${processName}`, 'error');
        return;
    }

    const procName = processNames[building.id] || building.id;

    appendOutput('Reading package lists...', 'info');

    setTimeout(() => {
        appendOutput('Building dependency tree...', 'info');

        setTimeout(() => {
            const outcome = Logic.Commands.dispatch(
                Logic.Commands.CommandType.BUILDING_BUY_MULTIPLE,
                { id: building.id, count: Math.max(1, count) },
                { actor: 'player', source: 'terminal' }
            );
            const bought = outcome.ok ? outcome.result : 0;

            if (bought > 0) {
                appendOutput(`Setting up ${procName} (${bought} instance${bought > 1 ? 's' : ''})...`, 'info');
                Logic.saveGame('terminal-building-buy');
                setTimeout(() => {
                    appendOutput(`[OK] ${procName} is now running`, 'success');
                }, 100);
            } else {
                appendOutput(`E: Unable to allocate memory for ${procName}`, 'error');
            }
        }, 150);
    }, 100);
}

function cmdUpgrade(args, Logic) {
    const { upgradesConfig } = Runtime;
    const { purchasedUpgrades, rp } = State;

    if (!args.length) {
        appendOutput('', 'info');
        appendOutput('Available system upgrades:', 'info');

        upgradesConfig.forEach((u, idx) => {
            const owned = purchasedUpgrades.includes(u.id);
            const cost = Logic.getUpgradeCost(u.id);
            const unlocked = Logic.isUpgradeUnlocked(u.id);
            const canAfford = unlocked && rp >= cost;

            if (owned) {
                appendOutput(`  [${idx + 1}] ${u.id.padEnd(25)} [INSTALLED]`, 'success');
            } else if (canAfford) {
                appendOutput(`  [${idx + 1}] ${u.id.padEnd(25)} Cost: ${formatNumber(cost)}`, 'highlight');
            } else {
                appendOutput(`  [${idx + 1}] ${u.id.padEnd(25)} Cost: ${formatNumber(cost)} [LOCKED]`, 'error');
            }
        });
        appendOutput('', 'info');
        appendOutput("Usage: upgrade <number> to install", 'info');
        return;
    }

    const idx = parseInt(args[0]) - 1;
    if (isNaN(idx) || idx < 0 || idx >= upgradesConfig.length) {
        appendOutput('Error: Invalid upgrade index', 'error');
        return;
    }

    const upgrade = upgradesConfig[idx];
    if (purchasedUpgrades.includes(upgrade.id)) {
        appendOutput('Error: Upgrade already installed', 'warning');
        return;
    }

    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.UPGRADE_BUY,
        { id: upgrade.id },
        { actor: 'player', source: 'terminal' }
    );
    if (!outcome.ok) {
        appendOutput('Error: Upgrade is locked or resources are insufficient', 'error');
        return;
    }

    Logic.saveGame('terminal-upgrade-buy');
    appendOutput(`Installed upgrade: ${upgrade.id}`, 'success');
}

async function cmdGitReflog() {
    const reflog = window.Game?.Reflog;
    if (!reflog) {
        appendOutput('fatal: reflog storage is unavailable', 'error');
        return;
    }
    try {
        const records = await reflog.list({ reason: 'annihilation', order: 'desc', limit: 10 });
        if (!records.length) {
            appendOutput('fatal: your current branch has no unreachable history', 'error');
            return;
        }
        records.forEach((record, index) => {
            const checksum = record.envelope?.checksum?.value || record.objectId;
            const shortId = String(checksum).slice(0, 9);
            const status = record.recoveredAt ? 'recovered' : 'unreachable';
            appendOutput(
                `${shortId} HEAD@{${index + 1}}: annihilation: checkpoint (${status})`,
                record.recoveredAt ? 'info' : 'warning'
            );
        });
        const recoverableIndex = records.findIndex(record => !record.recoveredAt);
        if (recoverableIndex >= 0) {
            appendOutput('', '');
            appendOutput(`hint: git reset --hard HEAD@{${recoverableIndex + 1}}`, 'info');
        }
    } catch (error) {
        appendOutput(`fatal: could not read reflog (${error?.code || error?.message || 'error'})`, 'error');
    }
}

async function cmdGitReset(target, Logic) {
    const match = /^head@\{(\d+)\}$/i.exec(String(target || ''));
    if (!match) {
        appendOutput('usage: git reset --hard HEAD@{n}', 'error');
        return;
    }
    const history = window.Game?.History;
    const reflog = window.Game?.Reflog;
    if (!history || !reflog) {
        appendOutput('fatal: recovery controller is unavailable', 'error');
        return;
    }

    appendOutput('Checking unreachable objects...', 'warning');
    try {
        const index = Number(match[1]) - 1;
        const records = await reflog.list({
            reason: 'annihilation',
            order: 'desc',
            limit: Math.max(10, index + 1)
        });
        const selected = Number.isSafeInteger(index) && index >= 0
            ? records[index]
            : null;
        if (!selected) {
            appendOutput(`fatal: ambiguous argument '${target}': unknown revision`, 'error');
            return;
        }
        if (selected.recoveredAt !== null && selected.recoveredAt !== undefined) {
            appendOutput(`fatal: ${target} has already been recovered`, 'error');
            return;
        }

        const result = await history.recoverLatest({ objectId: selected.objectId });
        if (!result) {
            appendOutput('fatal: no unrecovered annihilation checkpoint', 'error');
            return;
        }
        const checksum = result.saveResult?.envelope?.checksum?.value || result.objectId;
        appendOutput(`HEAD is now at ${String(checksum).slice(0, 9)}`, 'success');
        appendOutput(
            result.finalizationPending
                ? 'The world has returned. Reflog finalization will retry on the next load.'
                : 'The world returns exactly once. The reflog entry is now marked recovered.',
            result.finalizationPending ? 'warning' : 'success'
        );
        appendOutput('[AGI-CORE] I wondered whether you would remember that command.', 'highlight');
        if (DOM.terminalTitle) DOM.terminalTitle.textContent = 'research@workstation: ~/project [recovered]';
        submission.active = false;
        submission.stage = null;
        Logic.updateAll();
    } catch (error) {
        appendOutput(`fatal: recovery failed (${error?.stage || error?.code || 'error'})`, 'error');
        console.error('[Reflog] Recovery failed:', error);
    }
}

function syncTerminalSubmission(Logic) {
    const session = Logic.Submission.getSession();
    if (!session) return null;
    submission.selectedTier = (Runtime.submissionConfig.tiers || [])
        .find(tier => tier.id === session.tierId) || session.tierSnapshot;
    submission.investment = session.invested;
    submission.questions = session.questions;
    submission.currentQ = session.index;
    submission.currentChance = session.currentChance;
    submission.answers = session.answers;
    submission.targetVenue = session.targetVenue;
    return session;
}

function cmdGitPush(Logic) {
    const status = Logic.Submission.getStatus();
    const statuses = Logic.Submission.SubmissionStatus;

    if (status === statuses.RESOLVED) {
        submission.active = true;
        submission.stage = 'result';
        const session = syncTerminalSubmission(Logic);
        showSubmissionResult(Logic, session?.result);
        return;
    }

    if (status === statuses.ANSWERED) {
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_ADVANCE,
            {},
            { actor: 'player', source: 'terminal' }
        );
        submission.active = true;
        if (outcome.ok && typeof outcome.result?.success === 'boolean') {
            submission.stage = 'result';
            showSubmissionResult(Logic, outcome.result);
        } else {
            submission.stage = 'question';
            syncTerminalSubmission(Logic);
            showTerminalQuestion(Logic);
        }
        return;
    }

    if (status === statuses.REBUTTAL) {
        submission.active = true;
        submission.stage = 'question';
        syncTerminalSubmission(Logic);
        appendOutput('Resuming pending rebuttal...', 'warning');
        showTerminalQuestion(Logic);
        return;
    }

    if (status === statuses.PREPARED) {
        const tiers = Runtime.submissionConfig.tiers || [];
        const domainPending = Logic.Submission.getPending();
        submission.active = true;
        submission.stage = 'invest';
        submission.selectedTier = tiers.find(tier => tier.id === domainPending?.tierId) || null;
        submission.investment = domainPending?.invested || 0;
        if (!submission.selectedTier) {
            appendOutput('Prepared submission target is unavailable.', 'error');
            submission.active = false;
            return;
        }
        appendOutput('Resuming prepared submission...', 'warning');
        showInvestPrompt(Logic);
        return;
    }

    const tiers = Runtime.submissionConfig.tiers || [];
    const canAffordAny = tiers.some(tier => {
        const cost = Logic.Submission.getCurrentBaseCost(tier);
        return State.rp >= cost;
    });

    if (!canAffordAny) {
        appendOutput('Error: Insufficient resources for code review', 'error');
        appendOutput('Minimum cost: ' + formatNumber(
            Math.min(...tiers.map(tier => Logic.Submission.getCurrentBaseCost(tier)))
        ) + ' RP', 'info');
        return;
    }

    appendOutput('', '');
    appendOutput('Preparing manuscript submission...', 'info');
    appendOutput('', '');

    submission.active = true;
    submission.stage = 'tier';
    submission.selectedTier = null;
    submission.investment = 0;
    submission.questions = [];
    submission.currentQ = 0;
    submission.currentChance = 0;
    submission.answers = [];
    submission.targetVenue = null;

    const draftTitle = Logic.generatePaperTitle();
    Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_DRAFT_TITLE_SET,
        { title: draftTitle },
        { actor: 'player', source: 'terminal' }
    );
    appendOutput(`Draft: "${draftTitle}"`, 'info');
    appendOutput('', '');
    showTierSelection(Logic);
}

function showTierSelection(Logic) {
    const tiers = Runtime.submissionConfig.tiers || [];

    appendOutput('Available submission targets:', 'highlight');
    appendOutput('-'.repeat(50), 'info');

    tiers.forEach((tier, idx) => {
        const cost = Logic.Submission.getCurrentBaseCost(tier);
        const canAfford = State.rp >= cost;
        const baseRate = Math.round(tier.baseRate * 100);
        const maxRate = Math.round(tier.maxBaseChance * 100);
        const qCount = tier.questionConfig?.total || 1;
        const type = canAfford ? 'success' : 'info';

        appendOutput(`  [${idx + 1}] ${tier.name}`, type);
        appendOutput(`      Cost: ${formatNumber(cost)}  Rate: ${baseRate}%->${maxRate}%  Q: ${qCount}`, type);
    });

    appendOutput('-'.repeat(50), 'info');
    appendOutput(`Your RP: ${formatNumber(State.rp)}`, 'number');
    appendOutput('', '');
    appendOutput('Enter target (1-3) or "cancel":', 'prompt');
}

function handleSubmissionInput(input, Logic) {
    const lowerInput = input.toLowerCase();

    if (submission.stage === 'result') {
        Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_CLEAR,
            {},
            { actor: 'player', source: 'terminal' }
        );
        Logic.saveGame('terminal-submission-cleared');
        submission.active = false;
        submission.stage = null;
        appendOutput('', '');
        return;
    }

    appendOutput(`> ${input}`, 'prompt');

    if (lowerInput === 'cancel' || lowerInput === 'quit' || lowerInput === 'exit') {
        const paid = ['question'].includes(submission.stage);
        if (!paid) {
            const outcome = Logic.Commands.dispatch(
                Logic.Commands.CommandType.SUBMISSION_CLEAR,
                {},
                { actor: 'player', source: 'terminal' }
            );
            if (!outcome.ok) {
                appendOutput('The paid submission cannot be discarded.', 'error');
                return;
            }
            Logic.saveGame('terminal-submission-cancelled');
        }
        submission.active = false;
        submission.stage = null;
        appendOutput(paid ? 'Submission paused. Re-run git push to resume.' : 'Submission cancelled.', 'warning');
        appendOutput('', '');
        return;
    }

    switch (submission.stage) {
        case 'tier':
            handleTierInput(input, Logic);
            break;
        case 'invest':
            handleInvestInput(input, Logic);
            break;
        case 'confirm':
            handleConfirmInput(input, Logic);
            break;
        case 'question':
            handleQuestionInput(input, Logic);
            break;
    }
}

function handleTierInput(input, Logic) {
    const tiers = Runtime.submissionConfig.tiers || [];
    const tierNum = parseInt(input);

    if (isNaN(tierNum) || tierNum < 1 || tierNum > tiers.length) {
        appendOutput(`Invalid selection. Enter 1-${tiers.length} or "cancel".`, 'error');
        return;
    }

    const tier = tiers[tierNum - 1];
    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_PREPARE,
        { tierId: tier.id },
        { actor: 'player', source: 'terminal' }
    );
    const domainPending = Logic.Submission.getPending();
    if (!outcome.ok || !domainPending) {
        const cost = Logic.Submission.getCurrentBaseCost(tier);
        appendOutput(`Insufficient RP. Need ${formatNumber(cost)} RP.`, 'error');
        return;
    }

    submission.selectedTier = tier;
    submission.investment = domainPending.invested;
    submission.stage = 'invest';

    showInvestPrompt(Logic);
}

function showInvestPrompt(Logic) {
    const tier = submission.selectedTier;
    const pending = Logic.Submission.getPending();
    const cost = pending?.baseCost ?? Logic.Submission.getCurrentBaseCost(tier);
    const maxInvest = Logic.Submission.getMaxInvestment();

    appendOutput('', '');
    appendOutput(`Selected: ${tier.name}`, 'highlight');
    appendOutput(`Base cost: ${formatNumber(cost)} RP`, 'info');
    appendOutput(`Your RP: ${formatNumber(State.rp)}`, 'number');
    appendOutput(`Max additional investment: ${formatNumber(maxInvest)} RP`, 'info');
    appendOutput('', '');
    appendOutput('Enter additional investment (0-' + formatNumber(maxInvest) + ') or "max":', 'prompt');
}

function handleInvestInput(input, Logic) {
    const tier = submission.selectedTier;
    const maxInvest = Logic.Submission.getMaxInvestment();

    let investment = 0;
    if (input.toLowerCase() === 'max') {
        investment = maxInvest;
    } else {
        investment = parseInt(input);
        if (isNaN(investment) || investment < 0) {
            appendOutput('Invalid amount. Enter a number or "max".', 'error');
            return;
        }
        if (investment > maxInvest) {
            appendOutput(`Cannot invest more than ${formatNumber(maxInvest)} RP.`, 'error');
            return;
        }
    }

    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_INVEST,
        { amount: investment },
        { actor: 'player', source: 'terminal' }
    );
    if (!outcome.ok) {
        appendOutput('Unable to set investment.', 'error');
        return;
    }
    submission.investment = outcome.result;
    submission.stage = 'confirm';

    showConfirmPrompt(Logic);
}

function showConfirmPrompt(Logic) {
    const tier = submission.selectedTier;
    const cost = Logic.Submission.getPending()?.baseCost
        ?? Logic.Submission.getCurrentBaseCost(tier);
    const totalCost = cost + submission.investment;
    const chance = Logic.Submission.calculateChance(tier, submission.investment);
    const baseRate = Math.round(tier.baseRate * 100);
    const bonusRate = Math.round((chance - tier.baseRate) * 100);

    appendOutput('', '');
    appendOutput('='.repeat(50), 'info');
    appendOutput('SUBMISSION SUMMARY', 'highlight');
    appendOutput('='.repeat(50), 'info');
    appendOutput(`Target: ${tier.name}`, 'info');
    appendOutput(`Base cost: ${formatNumber(cost)} RP`, 'info');
    appendOutput(`Investment: ${formatNumber(submission.investment)} RP`, 'info');
    appendOutput(`Total cost: ${formatNumber(totalCost)} RP`, 'warning');
    appendOutput(`Success rate: ${baseRate}% + ${bonusRate}% = ${Math.round(chance * 100)}%`, 'success');
    const extraQuestions = Math.max(
        0,
        Math.round(Logic.Advisor.getAdvisorModifiers().rebuttalQuestionAdditive || 0)
    );
    appendOutput(`Questions: ${(tier.questionConfig?.total || 1) + extraQuestions}`, 'info');
    appendOutput('='.repeat(50), 'info');
    appendOutput('', '');
    appendOutput('Confirm submission? (yes/no):', 'prompt');
}

function handleConfirmInput(input, Logic) {
    const lowerInput = input.toLowerCase();

    if (lowerInput === 'yes' || lowerInput === 'y') {
        startRebuttal(Logic);
    } else if (lowerInput === 'no' || lowerInput === 'n') {
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_CLEAR,
            {},
            { actor: 'player', source: 'terminal' }
        );
        if (!outcome.ok) {
            appendOutput('The paid submission cannot be discarded.', 'error');
            return;
        }
        Logic.saveGame('terminal-submission-cancelled');
        submission.active = false;
        submission.stage = null;
        appendOutput('Submission cancelled.', 'warning');
        appendOutput('', '');
    } else {
        appendOutput('Enter "yes" or "no".', 'error');
    }
}

function startRebuttal(Logic) {
    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_START,
        {},
        { actor: 'player', source: 'terminal' }
    );
    if (!outcome.ok) {
        appendOutput('Submission could not be started.', 'error');
        return;
    }

    syncTerminalSubmission(Logic);
    submission.stage = 'question';
    Logic.saveGame('terminal-submission-start');

    appendOutput('', '');
    appendOutput(`Submitting to ${submission.targetVenue}...`, 'info');
    appendOutput('', '');

    setTimeout(() => {
        appendOutput('=' + '='.repeat(48) + '=', 'warning');
        appendOutput('|' + '        REBUTTAL ROUND        '.padStart(30).padEnd(48) + '|', 'warning');
        appendOutput('=' + '='.repeat(48) + '=', 'warning');
        appendOutput('', '');
        showTerminalQuestion(Logic);
    }, 500);
}

function showTerminalQuestion(Logic) {
    const session = syncTerminalSubmission(Logic);
    const q = session?.questions?.[session.index];

    if (!q) {
        if (session?.result) {
            showSubmissionResult(Logic, session.result);
            return;
        }
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_ADVANCE,
            {},
            { actor: 'player', source: 'terminal' }
        );
        if (outcome.ok && typeof outcome.result?.success === 'boolean') {
            showSubmissionResult(Logic, outcome.result);
        } else {
            appendOutput('Submission state is incomplete; progress was preserved.', 'error');
            submission.active = false;
        }
        return;
    }

    const total = session.questions.length;
    const current = session.index + 1;
    const questionText = q.q || q.question;
    const options = q.options || q.answers || [];

    appendOutput(`[Q${current}/${total}] Reviewer asks:`, 'highlight');
    appendOutput(`"${questionText}"`, 'info');
    appendOutput('', '');

    options.forEach((ans, idx) => {
        appendOutput(`  (${idx + 1}) ${ans}`, '');
    });

    appendOutput('', '');
    appendOutput(`Enter answer (1-${options.length}):`, 'prompt');
}

function handleQuestionInput(input, Logic) {
    const session = Logic.Submission.getSession();
    const q = session?.questions?.[session.index];
    if (!q) return;
    const options = q.options || q.answers || [];
    const ansNum = parseInt(input);

    if (isNaN(ansNum) || ansNum < 1 || ansNum > options.length) {
        appendOutput(`Invalid. Enter 1-${options.length}.`, 'error');
        return;
    }

    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_ANSWER,
        { optionIndex: ansNum - 1 },
        { actor: 'player', source: 'terminal' }
    );
    if (!outcome.ok) return;
    const answer = outcome.result;
    const deltaPercent = Math.round(Math.abs(answer.delta) * 100);

    if (answer.correct) {
        appendOutput(`[Correct!] +${deltaPercent}% -> ${Math.round(answer.newChance * 100)}%`, 'success');
    } else {
        appendOutput(`[Wrong!] -${deltaPercent}% -> ${Math.round(answer.newChance * 100)}%`, 'error');
    }

    appendOutput('', '');
    Logic.saveGame('terminal-submission-answer');
    if (submission.advanceTimer) clearTimeout(submission.advanceTimer);
    submission.advanceTimer = setTimeout(() => {
        submission.advanceTimer = null;
        if (!submission.active || submission.stage !== 'question') return;
        const advance = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_ADVANCE,
            {},
            { actor: 'player', source: 'terminal' }
        );
        if (!advance.ok) return;
        if (typeof advance.result?.success === 'boolean') {
            showSubmissionResult(Logic, advance.result);
        } else {
            showTerminalQuestion(Logic);
        }
    }, answer.isLast ? 500 : 300);
}

function showSubmissionResult(Logic, providedResult = null) {
    const session = syncTerminalSubmission(Logic);
    const result = providedResult || session?.result || null;
    if (!session || !result) return;
    const accepted = result.success;

    submission.stage = 'result';

    appendOutput('='.repeat(55), 'info');
    appendOutput('', '');

    if (accepted) {
        const acceptArt = [
            '    ___                        __           ____',
            '   /   | _____________  ____  / /____  ____/ / /',
            '  / /| |/ ___/ ___/ _ \\/ __ \\/ __/ _ \\/ __  / /',
            ' / ___ / /__/ /__/  __/ /_/ / /_/  __/ /_/ /_/',
            '/_/  |_\\___/\\___/\\___/ .___/\\__/\\___/\\__,_(_)',
            '                    /_/'
        ];
        acceptArt.forEach(line => appendOutput(line, 'success'));

        appendOutput('', '');
        appendOutput(`Your paper was ACCEPTED by ${result.venue}!`, 'success');

        appendOutput('', '');
        appendOutput(`Citations earned: +${formatNumber(result.rewards.citations)}`, 'number');
        appendOutput(`Bonus RP: +${formatNumber(result.rewards.rp)}`, 'number');

    } else {
        const rejectArt = [
            '    ____         _           __           __',
            '   / __ \\___    (_)__  _____/ /____  ____/ /',
            '  / /_/ / _ \\  / / _ \\/ ___/ __/ _ \\/ __  /',
            ' / _, _/  __/ / /  __/ /__/ /_/  __/ /_/ /',
            '/_/ |_|\\___/_/ /\\___/\\___/\\__/\\___/\\__,_/',
            '          /___/'
        ];
        rejectArt.forEach(line => appendOutput(line, 'error'));

        appendOutput('', '');
        appendOutput(`Your paper was REJECTED by ${result.venue}.`, 'error');
        if (result.rewards.refund > 0) {
            appendOutput(`Git Revert refund: +${formatNumber(result.rewards.refund)} RP`, 'number');
        }
    }

    appendOutput('', '');
    appendOutput(`Final chance: ${Math.round(result.chance * 100)}% (Roll: ${result.roll.toFixed(2)})`, 'info');
    appendOutput(`Rebuttal: ${result.correct}/${result.totalQuestions} correct`, 'info');
    appendOutput('='.repeat(55), 'info');
    appendOutput('', '');
    appendOutput('Press Enter to continue...', 'prompt');
    Logic.updateAll();
    Logic.saveGame('terminal-submission-resolved');
}

function cmdPrestige(Logic) {
    const requirements = Logic.Prestige.checkPrestigeRequirements();
    if (!requirements.canPrestige) {
        appendOutput(
            `Error: Need ${requirements.required} top-tier commits. Current: ${requirements.topTierCount}`,
            'error'
        );
        return;
    }

    appendOutput('Initiating full garbage collection...', 'warning');
    hide();

    const settlement = window.Game?.UI?.Settlement;
    if (settlement?.showConfirmation) {
        settlement.showConfirmation(Logic);
    } else {
        appendOutput('Error: settlement controller unavailable.', 'error');
        show();
    }
}

function cmdClear() {
    if (DOM.terminalOutput) {
        DOM.terminalOutput.innerHTML = '';
    }
}

function cmdAptList(Logic) {
    const { buildingsConfig } = Runtime;
    const { inventory, rp } = State;

    const visibleCount = Math.min(
        buildingsConfig.length,
        Object.values(inventory).filter(v => v > 0).length + 2
    );

    appendOutput('', 'info');
    appendOutput('Available packages:', 'info');
    appendOutput('  PID  PACKAGE              VERSION    COST         STATUS', 'info');
    appendOutput('  ---  -------              -------    ----         ------', 'info');

    buildingsConfig.forEach((b, idx) => {
        if (idx >= visibleCount) return;
        const count = inventory[b.id] || 0;
        const cost = Logic.calculateCost(b.baseCost, count);
        const canAfford = rp >= cost;
        const procName = (processNames[b.id] || b.id).replace(/_/g, '-');
        const version = `${(idx + 1)}.0.${Math.floor(Math.random() * 10)}`;

        let status = count > 0 ? `[installed: ${count}]` : '[not installed]';
        const type = canAfford ? 'success' : (count > 0 ? 'highlight' : 'error');

        appendOutput(
            `  ${String(idx + 1).padStart(3, '0')}  ${procName.padEnd(20)} ${version.padEnd(10)} ${formatNumber(cost).padEnd(12)} ${status}`,
            type
        );
    });
    appendOutput('', 'info');
    appendOutput("Use 'apt install <PID>' or 'apt install <package-name>' to install.", 'info');
}

function cmdFree() {
    const { rp } = State;
    const usedMem = Math.min(15.2, (rp / 10000000) * 16 + 2);
    const freeMem = 16 - usedMem;
    const cached = Math.min(8, usedMem * 0.4);

    appendOutput('', 'info');
    appendOutput('              total        used        free      shared  buff/cache   available', 'info');
    appendOutput(`Mem:           16Gi      ${usedMem.toFixed(1)}Gi      ${freeMem.toFixed(1)}Gi       0.5Gi      ${cached.toFixed(1)}Gi      ${(freeMem + cached * 0.8).toFixed(1)}Gi`, 'success');
    appendOutput('Swap:         8.0Gi       0.9Gi       7.1Gi', 'info');
    appendOutput('', 'info');
}

function cmdDf() {
    appendOutput('', 'info');
    appendOutput('Filesystem      Size  Used Avail Use% Mounted on', 'info');
    appendOutput('/dev/nvme0n1p2  932G  456G  429G  52% /', 'success');
    appendOutput('/dev/nvme0n1p1  511M  312M  200M  61% /boot/efi', 'info');
    appendOutput('/dev/sda1       3.6T  2.1T  1.4T  61% /data', 'info');
    appendOutput('tmpfs            16G  128M   16G   1% /dev/shm', 'info');
    appendOutput('', 'info');
}

function cmdNeofetch() {
    const { rp } = State;
    const usedMem = Math.min(15.2, (rp / 10000000) * 16 + 2);
    const uptimeMs = Date.now() - sessionStartTime;
    const uptimeHours = Math.floor(uptimeMs / 3600000);
    const uptimeMins = Math.floor((uptimeMs % 3600000) / 60000);

    const lines = [
        '',
        '        .--.         researcher@workstation',
        '       |o_o |        ----------------------',
        '       |:_/ |        OS: Ubuntu 22.04.3 LTS x86_64',
        '      //   \\ \\       Host: PhD Research Station',
        '     (|     | )      Kernel: 6.2.0-39-generic',
        `    /\\'\\   _/\`\\      Uptime: ${uptimeHours} hours, ${uptimeMins} mins`,
        '    \\___)=(___/      Shell: bash 5.1.16',
        '                     Terminal: gnome-terminal',
        '                     CPU: AMD Ryzen 9 7950X (32) @ 4.5GHz',
        '                     GPU: NVIDIA GeForce RTX 4090',
        `                     Memory: ${usedMem.toFixed(1)}GiB / 64GiB`,
        ''
    ];
    lines.forEach(line => appendOutput(line, 'highlight'));
}

function cmdWatch(args, Logic) {
    let interval = 2;
    let cmdArgs = args;
    if (args[0] === '-n' && args[1]) {
        interval = parseFloat(args[1]) || 2;
        cmdArgs = args.slice(2);
    }

    if (!cmdArgs.length) {
        appendOutput('Usage: watch [-n seconds] <command>', 'warning');
        appendOutput('Press q to quit.', 'info');
        return;
    }

    const command = cmdArgs.join(' ');

    stopWatch();
    watchCommand = command;

    const refresh = () => {
        cmdClear();
        const now = new Date().toLocaleTimeString();
        appendOutput(`Every ${interval}s: ${command}    ${now}`, 'info');
        appendOutput('', 'info');
        processCommand(command, Logic, true);
    };

    refresh();
    watchInterval = setInterval(refresh, interval * 1000);
}

function stopWatch() {
    if (watchInterval) {
        clearInterval(watchInterval);
        watchInterval = null;
        watchCommand = null;
    }
}

function cmdVerbose(args) {
    const enable = args[0] === 'on' || args[0] === '1' || args[0] === 'true';
    const disable = args[0] === 'off' || args[0] === '0' || args[0] === 'false';

    if (enable) {
        fakeLogEnabled = true;
        startFakeLog();
        appendOutput('Verbose logging enabled.', 'success');
    } else if (disable) {
        fakeLogEnabled = false;
        stopFakeLog();
        appendOutput('Verbose logging disabled.', 'success');
    } else {
        fakeLogEnabled = !fakeLogEnabled;
        if (fakeLogEnabled) {
            startFakeLog();
            appendOutput('Verbose logging enabled.', 'success');
        } else {
            stopFakeLog();
            appendOutput('Verbose logging disabled.', 'success');
        }
    }
}

function startFakeLog() {
    if (fakeLogInterval) return;

    const outputLog = () => {
        if (fakeLogPaused) return;
        if (submission.active) return;
        if (!isActive) return;

        const log = fakeLogTemplates[Math.floor(Math.random() * fakeLogTemplates.length)];
        appendOutput(log, 'info');
    };

    const scheduleNext = () => {
        if (!isActive) {
            fakeLogInterval = null;
            return;
        }
        const delay = 2000 + Math.random() * 3000;
        fakeLogInterval = setTimeout(() => {
            outputLog();
            scheduleNext();
        }, delay);
    };

    scheduleNext();
}

function stopFakeLog() {
    if (fakeLogInterval) {
        clearTimeout(fakeLogInterval);
        fakeLogInterval = null;
    }
}

/**
 * Handle tab auto-completion.
 * @param {string} input - Current input
 * @returns {string} Completed input
 */
export function handleTabComplete(input) {
    const parts = input.trim().split(/\s+/);
    const isFirstWord = parts.length <= 1;
    const currentWord = parts[parts.length - 1].toLowerCase();

    if (!currentWord) return input;

    if (isFirstWord) {
        const matches = commandList.filter(cmd => cmd.startsWith(currentWord));
        if (matches.length === 1) {
            return matches[0];
        }
    } else {
        const cmd = parts[0].toLowerCase();
        if (cmd === 'buy' || cmd === 'spawn' || (cmd === 'apt' && parts[1] === 'install')) {
            const procNameValues = Object.values(processNames);
            const matches = procNameValues.filter(name =>
                name.toLowerCase().startsWith(currentWord)
            );
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                return parts.join(' ');
            }
        }
    }
    return input;
}

/**
 * Setup keyboard listener for double-Ctrl activation.
 */
export function setupKeyboardListener() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control' && !e.repeat) {
            const now = Date.now();
            if (now - lastCtrlTime < 300) {
                toggle();
            }
            lastCtrlTime = now;
        }
    });
}

/**
 * Setup terminal input listener.
 * @param {Object} Logic - Logic module for command processing
 */
export function setupInputListener(Logic) {
    logicAdapter = Logic;
    if (!DOM.terminalCmd) return;

    DOM.terminalCmd.addEventListener('keydown', (e) => {
        if (watchInterval) {
            if (e.key === 'q' || (e.key === 'c' && e.ctrlKey)) {
                e.preventDefault();
                stopWatch();
                appendOutput('', 'info');
                appendOutput('watch: interrupted', 'warning');
                return;
            }
        }

        if (e.key === 'Enter') {
            const cmd = DOM.terminalCmd.value;
            DOM.terminalCmd.value = '';
            processCommand(cmd, Logic);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                DOM.terminalCmd.value = commandHistory[historyIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                DOM.terminalCmd.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length;
                DOM.terminalCmd.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const completed = handleTabComplete(DOM.terminalCmd.value);
            DOM.terminalCmd.value = completed;
        } else if (e.key === 'Escape') {
            hide();
        }
    });

    DOM.terminalCmd.addEventListener('focus', () => {
        fakeLogPaused = true;
    });

    DOM.terminalCmd.addEventListener('blur', () => {
        fakeLogPaused = false;
    });
}

/**
 * Setup click listener for RP generation in terminal.
 * @param {Object} Logic - Logic module for manual click
 */
export function setupClickListener(Logic) {
    const terminalMonitor = DOM.terminalMonitor;
    if (!terminalMonitor) return;

    terminalMonitor.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

        if (Logic?.Commands) {
            Logic.Commands.dispatch(
                Logic.Commands.CommandType.RESEARCH_CLICK,
                {},
                { actor: 'player', source: 'terminal' }
            );
        }

        const flash = document.createElement('div');
        flash.className = 'absolute inset-0 bg-green-500/5 pointer-events-none';
        flash.style.animation = 'fade-out 0.3s ease-out forwards';
        terminalMonitor.style.position = 'relative';
        terminalMonitor.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    });
}

/**
 * Get process names mapping.
 * @returns {Object}
 */
export function getProcessNames() {
    return processNames;
}
