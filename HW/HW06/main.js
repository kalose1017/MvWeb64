class HeartObject {
    constructor(x, y) {
        this.x = x; // 하트의 x좌표 설정
        this.y = y; // 하트의 y좌표 설정
        this.size = Math.random() * 20 + 10; // 크기를 랜덤으로 지정
        this.colors = ['black', 'red', 'yellow', 'blue', 'green', 'purple', 'orange']; // 하트 색상(7종류)
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)]; // 7가지 색상 중 랜덤으로 지정
        this.speedX = Math.random() * 4 - 2; // 하트의 x좌표 이동 속도를 랜덤으로 지정
        this.speedY = Math.random() * 4 - 2; // 하트의 y좌표 이동 속도를 랜덤으로 지정
        this.rotationSpeed = Math.PI / 180; // 회전 속도
        this.rotate = Math.floor(Math.random() * 5); // 회전 각도(속도)를 랜덤으로 지정
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y - 100); //하트를 해당 위치로 이동
        ctx.rotate(this.rotationSpeed * Math.PI / 180); // 회전 속도 지정

        ctx.beginPath();
        ctx.arc(-this.size / 2, 0, this.size / 2, Math.PI, 0); // 하트 왼쪽 상단 
        ctx.arc(this.size / 2, 0, this.size / 2, Math.PI, 0); // 하트 오른쪽 상단
        ctx.lineTo(0, this.size); // 하트 아래쪽 중앙
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill(); 
        ctx.restore();
    }

    update(canvas) {
        this.x += this.speedX; // x 좌표 업데이트
        this.y += this.speedY; // y 좌표 업데이트

        if (this.x > canvas.width || this.x < 0) { // 하트 벽 튕기기
            this.speedX = -this.speedX; 
        }
        if (this.y > canvas.height || this.y < 0) { 
            this.speedY = -this.speedY; 
        }

        this.rotationSpeed += this.rotate; // 회전 속도 업데이트
    }
}

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var mousePosition = { x: 0, y: 0 };
var hearts = [];
var maxHearts = 100;

canvas.addEventListener('mousemove', function(event) { // 마우스 커서위치 불러오기
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

setInterval(function() {
    if (hearts.length < maxHearts) {
        var heart = new HeartObject(mousePosition.x, mousePosition.y); // 하트를 100개까지 생성
        hearts.push(heart); // 배열에 추가
    } else {
        hearts.shift(); 
        var heart = new HeartObject(mousePosition.x, mousePosition.y); // 하트가 100개를 넘어가면 100개 하트 제일 첫 번째 하트를 제거
        hearts.push(heart); // 배열에 추가
    }
}, 200); // 딜레이 0.2초 지정

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < hearts.length; i++) {
        hearts[i].update(canvas);
        hearts[i].draw(ctx);
    }

    requestAnimationFrame(animate);
}

animate();
