let player;
let backgroundImg;
let obstacles;
let playerSprite;
let mailboxImg;
let currentFrame = 0;
let frameCounter = 0;
let facing = 'down';
let mailImg;
let isModalOpen = false;
let mailFloatOffset = 0;
let isYesPressed = false; // New flag to track if "Yes" button is pressed
const FLOAT_SPEED = 0.05;
const FLOAT_AMPLITUDE = 5;
const FRAME_DELAY = 8;

let playArea = {
    x: 530,
    y: 310,
    width: 845,
    height: 390
};

const spriteData = {
    frameWidth: 16,    // Width of each frame 
    frameHeight: 32,   // Height of each frame
    animations: {
        down: {
            startX: 0,
            startY: 32,    // Second row: down
            frames: [0, 1, 2, 3]
        },
        up: {
            startX: 0,
            startY: 96,    // Fourth row: up
            frames: [0, 1, 2, 3]
        },
        right: {
            startX: 0,
            startY: 64,    // Third row: right
            frames: [0, 1, 2, 3]
        },
        left: {
            startX: 0,
            startY: 128,   // Fifth row: left (32 * 4)
            frames: [0, 1, 2, 3]
        }
    }
};

function preload() {
    backgroundImg = loadImage('assets/background.png');
    mailboxImg = loadImage('assets/mailbox.png');
    playerSprite = loadImage('assets/Haley.png');
    mailImg = loadImage('assets/mail.png');
}

function drawPlayerSprite() {
    let animation = spriteData.animations[facing];
    let frameIndex = animation.frames[currentFrame];
    
    // Calculate sprite position to center it above the collision box
    let spriteX = player.x - (player.spriteWidth - player.size) / 2;
    let spriteY = player.y - player.spriteHeight + player.size; // Adjusted to avoid cropping the feet
    
    // Source position and size
    let sourceX = animation.startX + (frameIndex * spriteData.frameWidth);
    let sourceY = animation.startY + 1; // Adjusted to avoid showing the feet above
    
    image(playerSprite,
          spriteX, spriteY,                    // Destination position
          player.spriteWidth, player.spriteHeight,  // Destination size
          sourceX, sourceY,                    // Source position
          spriteData.frameWidth,               // Source width
          spriteData.frameHeight - 1);         // Adjusted source height to avoid showing the feet above
}

function setup() {
    let cnv = createCanvas(1920, 1080);
    // Add this line to prevent context menu on canvas
    cnv.canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Prevent context menu on modal overlay
    document.getElementById('modal-overlay').addEventListener('contextmenu', event => event.preventDefault());
    
    // Add close button click handler
    document.getElementById('close-button').addEventListener('click', hideModal);
    player = {
        x: playArea.x + 408,
        y: playArea.y + 205,
        size: 32,          // This will now be just for collision detection
        spriteWidth: 64,   // Width of displayed sprite
        spriteHeight: 128, // Height of displayed sprite
        speed: 2
    };
    
    obstacles = [
        {x: playArea.x + 68, y: playArea.y, width: 584, height: 205},
        {x: playArea.x + 68, y: playArea.y + 205, width: 70, height: 60},
        {x: playArea.x + 588, y: playArea.y + 205, width: 64, height: 60},
        {x: playArea.x + 68, y: playArea.y + 265, width: 260, height: 65},
        {x: playArea.x + 518, y: playArea.y + 265, width: 130, height: 65},
        {x: playArea.x + 648, y: playArea.y + 250, width: 70, height: 80}
    ];
}

function draw() {
    image(backgroundImg, 0, 0, width, height);
    
    let newX = player.x;
    let newY = player.y;
    let isMoving = false;
    let horizontalMovement = 0;
    let verticalMovement = 0;

    // Capture key states
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // 65 is 'A' key
        newX -= player.speed;
        horizontalMovement -= 1;
        isMoving = true;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // 68 is 'D' key
        newX += player.speed;
        horizontalMovement += 1;
        isMoving = true;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // 87 is 'W' key
        newY -= player.speed;
        verticalMovement -= 1;
        isMoving = true;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // 83 is 'S' key
        newY += player.speed;
        verticalMovement += 1;
        isMoving = true;
    }

    // Determine facing direction with priority
    if (horizontalMovement !== 0) {
        facing = horizontalMovement > 0 ? 'right' : 'left';
    } else if (verticalMovement !== 0) {
        facing = verticalMovement > 0 ? 'down' : 'up';
    }

    if (isMoving) {
        frameCounter++;
        if (frameCounter >= FRAME_DELAY) {
            currentFrame = (currentFrame + 1) % 4;
            frameCounter = 0;
        }
    } else {
        currentFrame = 0;
    }
    
    let canMove = true;
    for (let obstacle of obstacles) {
        if (checkCollision(newX, newY, player.size, player.size,
                          obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
            canMove = false;
            break;
        }
    }
    
    if (canMove) {
        player.x = constrain(newX, playArea.x, playArea.x + playArea.width - player.size);
        player.y = constrain(newY, playArea.y, playArea.y + playArea.height - player.size);
    }

    // Get the player's feet position for comparison
    let playerFeetY = player.y;
    let mailboxY = playArea.y + 185 + 80; // Adding approximate mailbox height for comparison point
    mailFloatOffset += FLOAT_SPEED;

    if (playerFeetY > mailboxY) {
        // Draw mailbox first, then player
        image(mailboxImg, 
            playArea.x + 648,
            playArea.y + 185
        );
        if (!isModalOpen && !isYesPressed) { // Check if "Yes" button is not pressed
            let floatingY = playArea.y + 115 + Math.sin(mailFloatOffset) * FLOAT_AMPLITUDE;
            image(mailImg,
                playArea.x + 648,
                floatingY
            );
        }
        drawPlayerSprite();
    } else {
        // Draw player first, then mailbox and mail
        drawPlayerSprite();
        image(mailboxImg, 
            playArea.x + 648,
            playArea.y + 185
        );
        if (!isModalOpen && !isYesPressed) { // Check if "Yes" button is not pressed
            let floatingY = playArea.y + 115 + Math.sin(mailFloatOffset) * FLOAT_AMPLITUDE;
            image(mailImg,
                playArea.x + 648,
                floatingY
            );
        }
    }

    if (isMouseOverMailbox() && !isModalOpen) {
        document.body.classList.add('mailbox-hover');
    } else {
        document.body.classList.remove('mailbox-hover');
    }
}

function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2);
}

function isMouseOverMailbox() {
    let mailboxX = playArea.x + 648;
    let mailboxY = playArea.y + 185;
    let mailboxWidth = 70;  // Width from obstacles array
    let mailboxHeight = 80; // Height from obstacles array
    let mailY = playArea.y + 115 + Math.sin(mailFloatOffset) * FLOAT_AMPLITUDE;
    
    return (
        mouseX > mailboxX && 
        mouseX < mailboxX + mailboxWidth && 
        mouseY > mailY && 
        mouseY < mailboxY + mailboxHeight
    );
}

function isPlayerNearMailbox() {
    let mailboxX = playArea.x + 648;
    let mailboxY = playArea.y + 300;
    let interactionDistance = 100; // Radius of interaction circle
    
    // Use player's feet position (bottom center of sprite) for distance calculation
    let playerFeetX = player.x + (player.size / 2);
    let playerFeetY = player.y + player.size; // Using the bottom of collision box
    
    // Calculate distance between player's feet and mailbox center
    let dx = playerFeetX - (mailboxX + 35); // 35 is half of mailbox width (70/2)
    let dy = playerFeetY - (mailboxY + 40); // 40 is half of mailbox height (80/2)
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < interactionDistance;
}

function mousePressed(event) {
    if (mouseButton === RIGHT) {
        event.preventDefault();
        
        if (isPlayerNearMailbox() && !isModalOpen && !isYesPressed) { // Check if "Yes" button is not pressed
            showModal();
        }
        return false;
    }
}

function keyPressed() {
    if (keyCode === ESCAPE && isModalOpen) {
        hideModal();
    }
}

function showModal() {
    isModalOpen = true;
    document.getElementById('modal-overlay').classList.remove('hidden');
    // Hide only tools
    document.getElementById('tools').classList.add('ui-hidden');
}

function hideModal() {
    isModalOpen = false;
    document.getElementById('modal-overlay').classList.add('hidden');
    // Show tools
    document.getElementById('tools').classList.remove('ui-hidden');
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.yes-button').addEventListener('click', () => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Set the flag to true
        isYesPressed = true;

        hideModal();
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    const noButton = document.querySelector('.no-button');
    const boundary = document.querySelector('.button-boundary');
    let timeout;
    let scale = 1; // Initial scale

    document.addEventListener('mousemove', (e) => {
        if (!isModalOpen) return;

        const noButtonRect = noButton.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const buttonCenterX = noButtonRect.left + noButtonRect.width / 2;
        const buttonCenterY = noButtonRect.top + noButtonRect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
        );

        if (distance < 200) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const boundaryRect = boundary.getBoundingClientRect();
                const maxX = boundaryRect.width - noButtonRect.width;
                const maxY = boundaryRect.height - noButtonRect.height;
                
                const randomX = Math.random() * maxX;
                const randomY = Math.random() * maxY;

                // Decrease scale with each move, minimum 0.5
                scale = Math.max(scale - 0.1, 0.5);
                
                noButton.style.left = `${randomX}px`;
                noButton.style.top = `${randomY}px`;
                noButton.style.transform = `scale(${scale})`;
            }, 50);
        }
    });

    // Reset scale when modal is closed
    document.getElementById('close-button').addEventListener('click', () => {
        scale = 1;
        noButton.style.transform = `scale(${scale})`;
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.yes-button').addEventListener('click', () => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Set the flag to true
        isYesPressed = true;

        // Add fade out transition
        const overlay = document.getElementById('fade-overlay');
        overlay.classList.remove('fade-in');  // Remove fade-in class if present
        overlay.classList.add('fade-out');    // Add fade-out class
        overlay.style.opacity = '1';          // Make overlay visible
        
        // Wait for confetti and fade effect before redirecting
        setTimeout(() => {
            window.location.href = 'flowers.html';
        }, 2000);  // Reduced to 2 seconds to match the fade animation duration

        hideModal();
    });
});

