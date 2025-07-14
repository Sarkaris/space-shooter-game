const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to fullscreen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Determine if the device is mobile based on screen width
const isMobile = canvas.width <= 768;

// Load spaceship and enemy images
const spaceshipImg = new Image();
spaceshipImg.src = 'spaceship.png'; // Path to spaceship image

const enemyImg = new Image();
enemyImg.src = 'enemy.png'; // Path to enemy image

// Laser properties (different sizes for mobile and PC)
const laserColor = 'red';
const laserWidth = isMobile ? 2 : 3;
const laserHeight = isMobile ? 15 : 20;

// Spaceship properties (different sizes for mobile and PC)
let spaceship = {
    x: canvas.width / 2 - (isMobile ? 35 : 50),
    y: canvas.height - (isMobile ? 80 : 60),
    width: isMobile ? 70 : 100,
    height: isMobile ? 70 : 100,
    speed: isMobile ? 8 : 10,
    firing: false,
    direction: 0
};

let lasers = [];
let enemies = [];
let stars = [];
let highestScore = localStorage.getItem('highestScore') || 0;
let currentScore = 0;
let gameOver = false;
let fireInterval;
let enemySpawnInterval;
let fireRate = 450;
let spawnRate = 1500;

// Star properties (different star counts and sizes for mobile and PC)
const starCount = isMobile ? 30 : 50;
const starMinSpeed = 1;
const starMaxSpeed = isMobile ? 1.5 : 2.5;

// Create stars with random positions and speeds
function createStars() {
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * (starMaxSpeed - starMinSpeed) + starMinSpeed,
            size: Math.random() * (isMobile ? 1 : 2) + 0.7
        });
    }
}

// Move stars to simulate space travel
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0; 
            star.x = Math.random() * canvas.width; 
        }
    });
}

// Touch or click to restart game
canvas.addEventListener("click", () => {
    if (gameOver) {
        restartGame();
    }
});

// Touch control for mobile
canvas.addEventListener("touchmove", (e) => {
    let touch = e.touches[0];
    spaceship.x = touch.clientX - spaceship.width / 2;
    e.preventDefault();
});

// Mouse control for desktop
canvas.addEventListener("mousemove", (e) => {
    spaceship.x = e.clientX - spaceship.width / 2;
});

// Auto-firing logic
setInterval(fireLaser, fireRate);

// Function to fire lasers
function fireLaser() {
    if (!gameOver) {
        lasers.push({
            x: spaceship.x + spaceship.width / 2 - laserWidth / 2,
            y: spaceship.y - laserHeight,
            width: laserWidth,
            height: laserHeight,
            speed: 12
        });
    }
}

// Function to spawn enemies randomly (different sizes for mobile and PC)
function spawnEnemy() {
    let enemyX = Math.random() * (canvas.width - (isMobile ? 30 : 50));
    let enemySpeed = Math.random() * 2 + 1; 
    enemies.push({
        x: enemyX,
        y: 0,
        width: isMobile ? 50 : 70,
        height: isMobile ? 50 : 70,
        speed: enemySpeed,
        isAlive: true
    });
}

// Start spawning enemies
enemySpawnInterval = setInterval(spawnEnemy, spawnRate);

// Increase difficulty every 10 seconds
setInterval(() => {
    if (!gameOver) {
        fireRate = Math.max(fireRate - 20, 50); 
        spawnRate = Math.max(spawnRate - 500, 500); 
        clearInterval(fireInterval); 
        fireInterval = setInterval(fireLaser, fireRate);
        clearInterval(enemySpawnInterval);
        enemySpawnInterval = setInterval(spawnEnemy, spawnRate);
    }
}, 10000);

// Update game state
function update() {
    if (gameOver) return;

    // Ensure spaceship stays within screen bounds
    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;

    // Move lasers
    lasers = lasers.filter(laser => laser.y > 0);
    lasers.forEach(laser => laser.y -= laser.speed);

    // Move enemies and check for collisions
    enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed;

        // Check for laser collision
        lasers.forEach((laser, laserIndex) => {
            if (
                laser.x < enemy.x + enemy.width &&
                laser.x + laser.width > enemy.x &&
                laser.y < enemy.y + enemy.height &&
                laser.y + laser.height > enemy.y
            ) {
                enemy.isAlive = false;
                lasers.splice(laserIndex, 1);
                currentScore += 10;
            }
        });

        // Check if enemy reaches the bottom
        if (enemy.isAlive && enemy.y + enemy.height > canvas.height) {
            gameOver = true;
        }
    });

    // Remove dead enemies
    enemies = enemies.filter(enemy => enemy.isAlive);

    // Update stars for space travel effect
    updateStars();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw spaceship
    ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

    // Draw lasers
    lasers.forEach(laser => {
        ctx.fillStyle = laserColor;
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${currentScore}`, 20, 30);
    ctx.fillText(`Highest Score: ${highestScore}`, 20, 60);

    // Draw Game Over message
    if (gameOver) {
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2 - 20);
        ctx.font = "30px Arial";
        ctx.fillText("Tap to Start New Game", canvas.width / 2 - 120, canvas.height / 2 + 30);
    }
}

// Restart the game
function restartGame() {
    if (currentScore > highestScore) {
        highestScore = currentScore;
        localStorage.setItem('highestScore', highestScore);
    }

    lasers = [];
    enemies = [];
    currentScore = 0;
    spaceship.x = canvas.width / 2 - spaceship.width / 2;
    gameOver = false;

    // Reset fire and spawn intervals
    fireRate = 200;
    spawnRate = 1500;

    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Initialize stars and start the game
createStars();
gameLoop();
