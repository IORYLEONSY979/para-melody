const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('musica');
const btnStart = document.getElementById('start-heart');
const barFill = document.getElementById('bar-fill');
const scoreDisp = document.getElementById('score');
const gameArea = document.getElementById('game-area');
const lyricText = document.getElementById('lyric-text');

let stars = [], celestials = [], score = 0, isBroken = false;
let audioCtx, analyser, dataArray;

// CONFIGURA AQUÍ LA LETRA DE TU CANCIÓN
const letras = [
    { time: 2, text: "Escucha esta melodía..." },
    { time: 8, text: "Nace de lo más profundo de mi corazón" },
    { time: 15, text: "Para la persona que ilumina mis días" },
    { time: 22, text: "Eres mi partitura eterna, Melody" },
    { time: 35, text: "Cada estrella brilla por ti" },
    { time: 50, text: "Mi técnica suprema es amarte" },
    { time: 70, text: "No hay límites en este universo..." },
    { time: 90, text: "Para lo que siento por ti" },
    { time: 120, text: "Tú eres mi razón de ser" },
    { time: 150, text: "Te amo infinitamente" },
    { time: 170, text: "ERROR: AMOR INCALCULABLE DETECTADO" }
];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initStars() {
    stars = [];
    for(let i=0; i<160; i++) {
        stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*2, o: Math.random() });
    }
}

class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.velX = Math.random() * 2 + 1;
        this.velY = Math.random() * 3 + 2;
    }
    draw() {
        ctx.fillStyle = this.type === 'comet' ? '#fff' : '#444';
        ctx.fillRect(this.x, this.y, 2, 2);
        this.x += this.velX; this.y += this.velY;
        if(this.y > canvas.height) this.reset();
    }
}

function spawnCat() {
    if(isBroken || document.hidden) return;
    const cat = document.createElement('div');
    cat.className = 'cat';
    cat.innerText = ['🐱', '🐈', '😽', '😻'][Math.floor(Math.random()*4)];
    cat.style.left = (Math.random() * 70 + 15) + "%";
    cat.style.top = (Math.random() * 50 + 15) + "%";

    cat.onclick = () => {
        score++;
        scoreDisp.innerText = score;
        const msg = document.createElement('div');
        msg.className = 'cat-msg';
        msg.innerText = ["TE AMO", "MIAU!", "❤️ MELODY", "LINDA!"][Math.floor(Math.random()*4)];
        cat.appendChild(msg);
        cat.style.pointerEvents = 'none';
        cat.classList.add('fading');
        setTimeout(() => cat.remove(), 2500);
    };
    gameArea.appendChild(cat);
    setTimeout(() => { if(cat.parentNode && !cat.classList.contains('fading')) cat.remove(); }, 4000);
}

function updateLyrics() {
    const time = audio.currentTime;
    const frase = letras.find((l, i) => time >= l.time && (!letras[i+1] || time < letras[i+1].time));
    if (frase && lyricText.innerText !== frase.text) {
        lyricText.classList.remove('lyric-pop');
        void lyricText.offsetWidth;
        lyricText.innerText = frase.text;
        lyricText.classList.add('lyric-pop');
    }
}

btnStart.addEventListener('click', () => {
    document.getElementById('intro').style.display = 'none';
    audio.play();
    initStars();
    celestials = [new Particle('comet'), new Particle('asteroid'), new Particle('comet')];
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    setInterval(spawnCat, 2200);
    animate();

    // Eventos de finalización (3:07 = 187 seg)
    setTimeout(() => {
        isBroken = true;
        document.getElementById('bar-parent').classList.add('shake');
        document.getElementById('overload-text').style.display = 'block';
        document.getElementById('porcentaje-amor').innerText = "∞ %";
        barFill.style.width = "145%";
    }, 170000); // 2:50 seg

    setTimeout(() => {
        document.getElementById('mensaje-final').classList.remove('hidden');
    }, 184000); // 3:04 seg
});

function animate() {
    requestAnimationFrame(animate);
    updateLyrics();
    analyser.getByteFrequencyData(dataArray);
    let avg = dataArray.reduce((a,b) => a+b) / dataArray.length;

    // Fondo reactivo
    ctx.fillStyle = `rgba(0, 0, ${10 + avg/4}, 0.5)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrellas vibrantes
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + avg/140})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
    });

    celestials.forEach(c => c.draw());

    if(!isBroken) {
        let p = (audio.currentTime / 175) * 100;
        // Movimiento suave de la barra con picos de música
        barFill.style.width = Math.min(99.9, p + avg/25) + "%";
        document.getElementById('porcentaje-amor').innerText = Math.round(p) + "%";
    }
}