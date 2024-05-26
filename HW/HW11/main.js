var canvas = document.getElementById('myCanvas');
var canvasContainer = document.getElementById('canvasContainer');
var canvasText = document.getElementById('canvasText');
var ctx = canvas.getContext('2d');
var starX, starY;
var playerX = canvas.width / 2;
var playerY = canvas.height / 2;
var playerSpeed = 2;
var starSpeed = 2;
var playerAngle = 0;
var rotationSpeed = 0.1;
var enemies = [];
var enemiesStack = [];
var heartHealth = 1;
var animationId;
var intervalId;
var gameEnded = false;
var keys = {};
var starCount = 0;
var currentNumber = 0;
var showStarCount = true;
var growingHeart = null;
var enemyCount = 0;

document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
});

document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
});

document.addEventListener('mousedown', function(event) {
    if (event.button === 0 && !growingHeart && currentNumber > 0) { // 좌클릭 (event.button === 0)
        createGrowingHeart();
        currentNumber--; // 커지는 하트가 생성될 때 currentNumber를 감소
    }
});

function movePlayer() {
    if (keys['ArrowUp'] || keys['KeyW']) {
        playerY -= playerSpeed;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        playerY += playerSpeed;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        playerX -= playerSpeed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        playerX += playerSpeed;
    }
}

function drawStar(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 6, y - size / 6);
    ctx.lineTo(x + size / 2, y - size / 10);
    ctx.lineTo(x + size / 4, y + size / 10);
    ctx.lineTo(x + size / 3, y + size / 2);
    ctx.lineTo(x, y + size / 4);
    ctx.lineTo(x - size / 3, y + size / 2);
    ctx.lineTo(x - size / 4, y + size / 10);
    ctx.lineTo(x - size / 2, y - size / 10);
    ctx.lineTo(x - size / 6, y - size / 6);
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
}

function drawHeart(x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size, size, -size / 3, 0, size / 2);
    ctx.bezierCurveTo(-size, -size / 3, -size / 2, -size, 0, -size / 2);
    ctx.fillStyle = 'rgb(192, 0, 0)';
    ctx.strokeStyle = 'rgb(0, 0, 0)'; // 테두리 색상
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function drawHeartAttack(x, y, size){
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size, size, -size / 3, 0, size / 2);
    ctx.bezierCurveTo(-size, -size / 3, -size / 2, -size, 0, -size / 2);
    ctx.strokeStyle = 'rgb(255, 255, 0)'; // 테두리 색상
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    clearCanvas();
    movePlayer();
    checkPlayerCollisionWithStar();
    drawHeart(canvas.width / 2, canvas.height / 2, 30, playerAngle); // 플레이어 하트
    drawStar(starX - playerX + canvas.width / 2, starY - playerY + canvas.height / 2, 40);
    if (growingHeart) {
        growHeart();
    }
    drawEnemies();
    drawStarCount();
}

function autoRotate() {
    if (!gameEnded) {
        playerAngle += rotationSpeed;
        update();
        animationId = requestAnimationFrame(autoRotate);
    }
}

var startButton = document.getElementById('startButton');
startButton.addEventListener('click', function() {
    startButton.style.display = 'none';
    canvasContainer.style.border = 'none';
    canvasText.classList.add('hidden');
    var initialEnemyCount = Math.floor(Math.random() * 11) + 5;
    for (var i = 0; i < initialEnemyCount; i++) {
        createEnemy();
    }
    drawRandomStar();
    autoRotate();
    intervalId = setInterval(function() {
        createEnemy();
    }, 1000);
});

function drawRandomStar() {
    starX = Math.random() * canvas.width;
    starY = Math.random() * canvas.height;
    update();
}

function createEnemy() {
    var angle = Math.random() * Math.PI * 2;
    var startX = Math.random() * canvas.width;
    var startY = Math.random() * canvas.height;

    if (Math.random() < 0.5) {
        startX = Math.random() < 0.5 ? -canvas.width : canvas.width * 1.5;
    } else {
        startY = Math.random() < 0.5 ? -canvas.height : canvas.height * 1.5;
    }
    var speed = Math.random() * 3 + 1;
    var enemy = {
        x: startX,
        y: startY,
        radius: Math.random() * 10 + 5,
        color: getRandomColor(),
        speed: speed
    };
    enemy.speedX = Math.cos(angle) * enemy.speed;
    enemy.speedY = Math.sin(angle) * enemy.speed;
    enemies.push(enemy);
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        moveTowardsCenter(enemy);
        drawCircle(enemy.x - playerX + canvas.width / 2, enemy.y - playerY + canvas.height / 2, enemy.radius, enemy.color);
        if (isColliding(enemy)) {
            enemies.splice(i, 1);
            heartHealth--;
            if (heartHealth <= 0) {
                endGame();
            }
            i--;
        } else if (isAtCenter(enemy)) {
            if (growingHeart && isCollidingWithGrowingHeart(enemy)) {
                enemies.splice(i, 1); // 충돌한 적 제거
                enemyCount++;
                i--;
            } else {
                enemiesStack.push(enemy);
                enemies.splice(i, 1);
                i--;
            }
        }
    }
}


function moveTowardsCenter(enemy) {
    var dx = canvas.width / 2 - enemy.x;
    var dy = canvas.height / 2 - enemy.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var speed = enemy.speed;
    if (distance > 1) {
        enemy.x += dx / distance * speed;
        enemy.y += dy / distance * speed;
    }
}

function isColliding(enemy) {
    var dx = playerX - enemy.x;
    var dy = playerY - enemy.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < enemy.radius + 30;
}

function isAtCenter(enemy) {
    var dx = canvas.width / 2 - enemy.x;
    var dy = canvas.height / 2 - enemy.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 5;
}

function checkPlayerCollisionWithStar() {
    var dx = playerX - starX;
    var dy = playerY - starY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var playerRadius = 30;
    var starRadius = 40;

    if (distance < playerRadius + starRadius) {
        starCount++;
        currentNumber++;
        drawRandomStar();
        drawStarCount();
    }
}


function createGrowingHeart() {
    growingHeart = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 0,
        angle: playerAngle
    };
}

function growHeart() {
    if (growingHeart) {
        growingHeart.size += 2;
        if (growingHeart.size > 300) {
            growingHeart = null; // 하트가 최대 크기에 도달하면 제거
        }
    }
    if (growingHeart) {
        drawHeartAttack(growingHeart.x, growingHeart.y, growingHeart.size);
        // 충돌 감지 및 적 제거
        for (var i = 0; i < enemies.length; i++) {
            if (isCollidingWithGrowingHeart(enemies[i])) {
                enemies.splice(i, 1); // 충돌한 적 제거
                enemyCount++;
                i--;
            }
        }
    }
}

function isCollidingWithGrowingHeart(enemy) {
    if (!growingHeart) return false;
    var dx = growingHeart.x - (enemy.x - playerX + canvas.width / 2);
    var dy = growingHeart.y - (enemy.y - playerY + canvas.height / 2);
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (growingHeart.size / 2 + enemy.radius);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function endGame() {
    clearCanvas();
    gameEnded = true;
    showStarCount = false;
    cancelAnimationFrame(animationId);
    clearInterval(intervalId);
    startButton.style.display = 'block';
    ctx.fillStyle = 'white';
    ctx.font = '70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('유다희', canvas.width / 2, canvas.height / 2);
    canvasContainer.style.border = '1px solid rgb(0, 0, 0)';
    canvasContainer.style.backgroundColor = 'rgb(255, 0, 0)';
    canvasText.style.color = 'rgb(255, 255, 255)';
    enemies = [];
    enemiesStack = [];
    heartHealth = 1;
    startButton.addEventListener('click', startGame);
}

function startGame() {
    gameEnded = false;
    currentNumber = 0;
    starCount = 0;
    enemyCount = 0;
    showStarCount = true;
    startButton.style.display = 'none';
    canvasText.classList.add('hidden');
    var initialEnemyCount = Math.floor(Math.random() * 11) + 5;
    for (var i = 0; i < initialEnemyCount; i++) {
        createEnemy();
    }
    drawRandomStar();
    autoRotate();
    intervalId = setInterval(function() {
        createEnemy();
    }, 1000);
    canvasContainer.style.border = '1px solid rgb(255, 255, 255)';
    canvasContainer.style.backgroundColor = 'rgb(72, 153, 242)';
    canvasText.style.color = 'white';
    startButton.removeEventListener('click', startGame);
}

function drawStarCount() {
    if (!showStarCount) return; // 숫자를 표시하지 않도록 설정된 경우 함수 종료
    var numberString = currentNumber.toString();

    // 각 숫자를 그리는 좌표 배열
    var digitCoordinates = [
        [[0, 0], [10, 0], [10, 20], [0, 20], [0, 0]],
        [[10, 0], [10, 20]],
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 20], [10, 20]],
        [[0, 0], [10, 0], [10, 10], [0, 10], [10, 10], [10, 20], [0, 20]],
        [[0, 0], [0, 10], [10, 10], [10, 0], [10, 20]],
        [[10, 0], [0, 0], [0, 10], [10, 10], [10, 20], [0, 20]],
        [[10, 0], [0, 0], [0, 20], [10, 20], [10, 10], [0, 10]],
        [[0, 0], [10, 0], [10, 20]],
        [[0, 10], [0, 0], [10, 0], [10, 10], [0, 10], [0, 20], [10, 20], [10, 10]],
        [[10, 10], [0, 10], [0, 0], [10, 0], [10, 20], [0, 20]]
    ];

    // 각 자릿수를 그림
    var digitWidth = 20; // 각 숫자의 기본 너비
    var startX = 80; // 숫자를 그리는 시작 X 좌표 (STAR: 텍스트 뒤에 위치)
    var startY = 15; // 시작 Y 좌표

    // "STAR: " 텍스트를 그림
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('STAR : ', 10, 30);

    // 각 숫자를 그림
    for (var i = 0; i < numberString.length; i++) {
        var digit = parseInt(numberString.charAt(i));
        var coordinates = digitCoordinates[digit];

        ctx.beginPath();       
        // 각 숫자를 그리는 좌표 이동 및 그리기
        for (var j = 0; j < coordinates.length; j++) {
            if (j === 0) {
                ctx.moveTo(startX + coordinates[j][0] + i * digitWidth, startY + coordinates[j][1]);
            } else {
                ctx.lineTo(startX + coordinates[j][0] + i * digitWidth, startY + coordinates[j][1]);
            }
        }
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.stroke(); // 선을 그림
    }

    // "Enemy: " 텍스트와 적 제거 수를 그림
    ctx.fillText('Enemy: ' + enemyCount, canvas.width - 120, 30);
}


function pushEnemyToStack() {
    if (enemies.length > 0) {
        var enemy = enemies.pop();
        enemiesStack.push(enemy);
    }
}

function popEnemyFromStack() {
    if (enemiesStack.length > 0) {
        var enemy = enemiesStack.pop();
        relocateEnemy(enemy);
    }
}

function relocateEnemy(enemy) {
    var angle = Math.random() * Math.PI * 2;
    var startX = Math.random() * canvas.width;
    var startY = Math.random() * canvas.height;

    if (Math.random() < 0.5) {
        startX = Math.random() < 0.5 ? -canvas.width : canvas.width * 1.5;
    } else {
        startY = Math.random() < 0.5 ? -canvas.height : canvas.height * 1.5;
    }
    enemy.x = startX;
    enemy.y = startY;
    enemy.speedX = Math.cos(angle) * enemy.speed;
    enemy.speedY = Math.sin(angle) * enemy.speed;
    enemies.push(enemy);
}
