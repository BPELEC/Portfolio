const canvas = document.getElementById('glCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 150 };
let follower = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let clickEffects = [];
let initialized = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!initialized) {
        mouse.x = canvas.width / 2;
        mouse.y = canvas.height / 2;
        follower.x = canvas.width / 2;
        follower.y = canvas.height / 2;
        initialized = true;
    }
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ClickEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 50;
        this.opacity = 1;
    }

    update() {
        this.radius += 2;
        this.opacity -= 0.02;
    }

    draw() {
        ctx.strokeStyle = `rgba(100, 100, 100, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.strokeStyle = `rgba(68, 68, 68, ${1 - distance / 120})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        if (mouse.x !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                ctx.strokeStyle = `rgba(100, 100, 100, ${1 - distance / mouse.radius})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function drawMouseFollower() {
    if (mouse.x !== null && initialized) {
        follower.x += (mouse.x - follower.x) * 0.1;
        follower.y += (mouse.y - follower.y) * 0.1;

        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.beginPath();
        ctx.arc(follower.x, follower.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(120, 120, 120, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(follower.x, follower.y, 18, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    connectParticles();
    drawMouseFollower();

    clickEffects = clickEffects.filter(effect => effect.opacity > 0);
    clickEffects.forEach(effect => {
        effect.update();
        effect.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('click', (e) => {
    clickEffects.push(new ClickEffect(e.x, e.y));
});

resizeCanvas();
animate();
