// Cyber Mainframe Grid Engine - Core Logic with Background Terminal Context
const canvas = document.getElementById('cyberGrid');
const ctx = canvas.getContext('2d');
const termInput = document.getElementById('terminalInput');

let points = [];
const spacing = 45; 
let cols = 0, rows = 0;

const mouse = { x: null, y: null, isPressed: false, radius: 220 };
let activeMode = 'none'; 
let globalColor = { r: 0, g: 255, b: 180 }; 
let waveTime = 0;
const shockwaves = [];

// Persistent logs displayed transparently inside the background HUD overlay
const maxConsoleLogs = 10;
const consoleLogs = [
    "SECURE MAINFRAME CONNECTION INITIATED...",
    "AUDIO SUBSYSTEM READY. INTERACTION REQUIRED.",
    "STATUS: UNLOCKED. TYPE '/' FOR CONSOLE PANEL."
];

// Web Audio Synthesis Nodes
let audioCtx = null;
let humOsc = null;
let humGain = null;

function addConsoleLog(text) {
    consoleLogs.push("[" + new Date().toLocaleTimeString() + "] " + text.toUpperCase());
    if (consoleLogs.length > maxConsoleLogs) {
        consoleLogs.shift();
    }
}

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        humOsc = audioCtx.createOscillator();
        humGain = audioCtx.createGain();
        
        humOsc.type = 'triangle';
        humOsc.frequency.setValueAtTime(55, audioCtx.currentTime); 
        humGain.gain.setValueAtTime(0, audioCtx.currentTime); 
        
        humOsc.connect(humGain);
        humGain.connect(audioCtx.destination);
        humOsc.start();
        addConsoleLog("CORE AUDIO SYSTEM ENERGIZED.");
    } catch(e) {
        console.error("Audio initialization blocked or unsupported:", e);
    }
}

function playShockwaveSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); 
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.4); 
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5); 
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.5);
}

function initGrid() {
    points = [];
    cols = Math.ceil(window.innerWidth / spacing) + 4;
    rows = Math.ceil(window.innerHeight / spacing) + 4;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const startX = (c - 2) * spacing;
            const startY = (r - 2) * spacing;
            points.push({
                x: startX, y: startY, origX: startX, origY: startY,
                col: c, row: r, vx: 0, vy: 0,
                char: Math.random() > 0.5 ? "1" : "0",
                charTimer: Math.random() * 100,
                seed: Math.random() * Math.PI * 2
            });
        }
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
}
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => { 
    initAudio(); 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
    
    if (audioCtx && humGain) {
        const normalizedY = 1 - (e.clientY / window.innerHeight);
        humOsc.frequency.setTargetAtTime(55 + (normalizedY * 60), audioCtx.currentTime, 0.1);
        humGain.gain.setTargetAtTime(0.03, audioCtx.currentTime, 0.2);
    }
});

window.addEventListener('mousedown', (e) => { 
    if(termInput.style.display === 'block') return;
    initAudio();
    mouse.isPressed = true; 
    shockwaves.push({ x: e.clientX, y: e.clientY, radius: 10, maxRadius: 300, alpha: 1, speed: 8 });
    playShockwaveSound();
});

window.addEventListener('mouseup', () => { mouse.isPressed = false; });

window.addEventListener('mouseleave', () => { 
    mouse.x = null; mouse.y = null; mouse.isPressed = false; 
    if (humGain) humGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
});

window.addEventListener('keydown', (e) => {
    if (e.key === '/' && termInput.style.display !== 'block') {
        e.preventDefault();
        termInput.style.color = "rgb(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ")";
        termInput.style.display = 'block';
        termInput.value = '';
        termInput.focus();
        mouse.isPressed = false;
    } else if (e.key === 'Escape' && termInput.style.display === 'block') {
        termInput.style.display = 'none';
    } else if (e.key === 'Enter' && termInput.style.display === 'block') {
        processCommand(termInput.value.trim().toLowerCase());
        termInput.style.display = 'none';
    }
});

function processCommand(cmd) {
    if (cmd === 'wave') {
        activeMode = 'wave';
        addConsoleLog("MODE UPDATED: WAVE MOTION INTERFACE ACTIVATED.");
    } else if (cmd === 'random') {
        activeMode = 'random';
        addConsoleLog("MODE UPDATED: BROWNIAN JITTER MATRIX ACTIVATED.");
    } else if (cmd === 'reset') {
        activeMode = 'none';
        globalColor = { r: 0, g: 255, b: 180 };
        addConsoleLog("SYSTEM MASTER PARAMETERS CONFIGURED TO STABLE BASELINE.");
    } else if (cmd === 'help') {
        addConsoleLog("--- AVAILABLE TERMINAL CORE PROTOCOLS ---");
        addConsoleLog("HELP         - DISPLAYS ALL ACCESSIBLE KERNEL UTILITIES.");
        addConsoleLog("WAVE         - OSCILLATES TOPOLOGY GRAPH VIA SINE EQUATIONS.");
        addConsoleLog("RANDOM       - SHIFTS INDIVIDUAL NODE VECTORS SPORADICALLY.");
        addConsoleLog("COLOR [VAL]  - ALTERS GLOW HARMONICS (E.G. RED, CYAN, HEX).");
        addConsoleLog("RESET        - RESTORES BASE MATRIX STRUCTS AND SEED MODES.");
    } else if (cmd.startsWith('color ')) {
        const colorVal = cmd.replace('color ', '');
        parseColor(colorVal);
    } else {
        addConsoleLog("UNKNOWN ROUTINE: '" + cmd + "'. ATTEMPT 'HELP' TO SEE ALL CORE VALUES.");
    }
}

function parseColor(val) {
    const dummy = document.createElement('div'); 
    dummy.style.color = val; 
    document.body.appendChild(dummy);
    const computed = window.getComputedStyle(dummy).color; 
    document.body.removeChild(dummy);
    
    const match = computed.match(/\d+/g);
    if (match && match.length >= 3) {
        globalColor.r = parseInt(match[0]); 
        globalColor.g = parseInt(match[1]); 
        globalColor.b = parseInt(match[2]);
        addConsoleLog("COLOR CHANNEL LINKED: RGB(" + globalColor.r + "," + globalColor.g + "," + globalColor.b + ")");
    } else {
        addConsoleLog("COLOR INTERPRETATION ERROR. SPECIFY VALID HEX OR STRING CONFIGS.");
    }
}

function animate() {
    ctx.fillStyle = 'rgba(2, 4, 10, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    waveTime += 0.03;

    // Render Background Terminal HUD Logs
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '13px monospace';
    ctx.fillStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", 0.4)";
    for (let i = 0; i < consoleLogs.length; i++) {
        ctx.fillText(consoleLogs[i], 30, 30 + (i * 20));
    }

    // Process Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        let sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha = 1 - (sw.radius / sw.maxRadius);
        if (sw.alpha <= 0) { shockwaves.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", " + (sw.alpha * 0.4) + ")";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Process Mesh Physics
    points.forEach(p => {
        let targetX = p.origX;
        let targetY = p.origY;

        if (activeMode === 'wave') {
            targetY += Math.sin(p.col * 0.25 + waveTime) * 20;
            targetX += Math.cos(p.row * 0.25 + waveTime) * 20;
        } else if (activeMode === 'random') {
            targetX += Math.sin(p.seed + waveTime * 4) * 6;
            targetY += Math.cos(p.seed + waveTime * 4) * 6;
        }

        shockwaves.forEach(sw => {
            const dx = p.x - sw.x;
            const dy = p.y - sw.y;
            const dist = Math.hypot(dx, dy);
            const diff = dist - sw.radius;
            if (Math.abs(diff) < 40 && dist > 0) {
                const push = (40 - Math.abs(diff)) / 40 * sw.alpha * 45;
                targetX += (dx / dist) * push;
                targetY += (dy / dist) * push;
            }
        });

        if (mouse.isPressed && mouse.x !== null && mouse.y !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < mouse.radius && dist > 0) {
                const pull = Math.pow((mouse.radius - dist) / mouse.radius, 1.5);
                targetX += (mouse.x - p.x) * pull * 0.9;
                targetY += (mouse.y - p.y) * pull * 0.9;
            }
        }

        p.vx += (targetX - p.x) * 0.08;
        p.vy += (targetY - p.y) * 0.08;
        p.vx *= 0.78; p.vy *= 0.78; 
        p.x += p.vx; p.y += p.vy;
    });

    // Draw Grid Connections
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.col < cols - 1 && points[i + 1] && points[i + 1].col === p.col + 1) drawLinkLine(p, points[i + 1]);
        if (p.row < rows - 1 && points[i + cols]) drawLinkLine(p, points[i + cols]);
    }

    // Draw Dynamic Nodes
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    points.forEach(p => {
        p.charTimer--;
        if (p.charTimer <= 0) {
            p.char = Math.random() > 0.5 ? "1" : "0";
            p.charTimer = 60 + Math.random() * 120;
        }

        let factor = 0;
        if (mouse.x !== null && mouse.y !== null) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < mouse.radius) factor = 1 - (dist / mouse.radius);
        }

        if (factor > 0.3) {
            ctx.font = "bold " + (9 + Math.floor(factor * 4)) + "px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.3 + factor * 0.7) + ")";
            ctx.fillText(p.char, p.x, p.y);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", 0.25)";
            ctx.fill();
        }
    });

    // Draw HUD Tactical Tracking Reticle
    if (mouse.x !== null && mouse.y !== null) {
        const glowRGB = "rgb(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ")";
        
        ctx.shadowBlur = mouse.isPressed ? 20 : 10;
        ctx.shadowColor = glowRGB;

        ctx.strokeStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", " + (mouse.isPressed ? 0.8 : 0.4) + ")";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.isPressed ? 18 : 25, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouse.x, 0); ctx.lineTo(mouse.x, canvas.height);
        ctx.moveTo(0, mouse.y); ctx.lineTo(canvas.width, mouse.y);
        ctx.stroke();
    }

    requestAnimationFrame(animate);
}

function drawLinkLine(p1, p2) {
    let baseAlpha = 0.12;
    if (mouse.x !== null && mouse.y !== null) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(midX - mouse.x, midY - mouse.y);

        if (dist < mouse.radius) {
            const factor = Math.pow(1 - (dist / mouse.radius), 1.8);
            const r = Math.min(255, globalColor.r + Math.floor(factor * (255 - globalColor.r)));
            const g = Math.min(255, globalColor.g + Math.floor(factor * (255 - globalColor.g)));
            const b = Math.min(255, globalColor.b + Math.floor(factor * (255 - globalColor.b)));
            
            ctx.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + (0.12 + factor * 0.75) + ")";
            ctx.lineWidth = 1 + factor * 1.2;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            return;
        }
    }
    ctx.strokeStyle = "rgba(" + globalColor.r + ", " + globalColor.g + ", " + globalColor.b + ", " + baseAlpha + ")";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
}

resize();
animate();
