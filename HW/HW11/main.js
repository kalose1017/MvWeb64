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
        var heartHealth = 3;
        var animationId;
        var intervalId;
        var gameEnded = false;
        var keys = {};

        document.addEventListener('keydown', function(event) {
            keys[event.code] = true;
        });

        document.addEventListener('keyup', function(event) {
            keys[event.code] = false;
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

        function drawStar(x, y) {
            ctx.beginPath();
            ctx.moveTo(x, y - 30);
            ctx.lineTo(x + 10, y - 10);
            ctx.lineTo(x + 40, y - 5);
            ctx.lineTo(x + 15, y + 5);
            ctx.lineTo(x + 25, y + 30);
            ctx.lineTo(x, y + 15);
            ctx.lineTo(x - 25, y + 30);
            ctx.lineTo(x - 15, y + 5);
            ctx.lineTo(x - 40, y - 5);
            ctx.lineTo(x - 10, y - 10);
            ctx.closePath();
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }

        function drawHeart(x, y, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.bezierCurveTo(20, -50, 60, -20, 0, 30);
            ctx.bezierCurveTo(-60, -20, -20, -50, 0, -30);
            ctx.fillStyle = 'rgb(192, 0, 0)';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fill();
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
            drawHeart(canvas.width / 2, canvas.height / 2, playerAngle);
            drawStar(starX - playerX + canvas.width / 2, starY - playerY + canvas.height / 2);
            drawEnemies();
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
            var enemyCount = Math.floor(Math.random() * 11) + 5;
            for (var i = 0; i < enemyCount; i++) {
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
                    enemiesStack.push(enemy);
                    enemies.splice(i, 1);
                    i--;
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
            return distance < 5;  // 중앙에 거의 도달했을 때
        }

        function checkPlayerCollisionWithStar() {
            var dx = playerX - starX;
            var dy = playerY - starY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var playerRadius = 30;
            var starRadius = 40;

            if (distance < playerRadius + starRadius) {
                console.log("플레이어가 별에 내접했습니다!");
            }
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
            heartHealth = 3;
            startButton.addEventListener('click', startGame);
        }

        function startGame() {
            gameEnded = false;
            startButton.style.display = 'none';
            canvasText.classList.add('hidden');
            var enemyCount = Math.floor(Math.random() * 11) + 5;
            for (var i = 0; i < enemyCount; i++) {
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