    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

    var starX = Math.random() * (canvas.width - 100) + 50;
    var starY = Math.random() * (canvas.height - 100) + 50;

    function drawStar(x, y, radius, spikes, color) {
        var step = Math.PI / spikes;
        var rotation = Math.PI / 2 * 3;
        var cx = x;
        var cy = y;
        var color = "yellow";
        var x2;
        var y2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius);
        for (var i = 0; i < spikes; i++) {
            x2 = cx + Math.cos(rotation) * radius;
            y2 = cy + Math.sin(rotation) * radius;
            ctx.lineTo(x2, y2);
            rotation += step;

            x2 = cx + Math.cos(rotation) * (radius * 0.5);
            y2 = cy + Math.sin(rotation) * (radius * 0.5);
            ctx.lineTo(x2, y2);
            rotation += step;
        }
        ctx.lineTo(cx, cy - radius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
    // 원을 그리는 함수
    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    // 하트를 그리고 회전하는 함수
    function drawAndRotateHeart() {
        // 캔버스의 정중앙 좌표
        var heartCenterX = canvas.width / 2;
        var heartCenterY = canvas.height / 2;

        // 하트의 크기
        var heartSize = 100;

        // 하트를 그리고 회전
        drawHeart(ctx, heartCenterX, heartCenterY, heartSize, 'red', rotation);
    }

    // 하트를 그리고 회전하는 함수
    function drawHeart(ctx, x, y, size, color, rotation) {
        ctx.save(); // 현재 변형 상태를 스택에 저장
        ctx.translate(x, y); // 좌표 원점을 하트의 중심으로 이동
        ctx.rotate(rotation); // 회전 적용
        ctx.translate(-size / 2, -size / 2); // 중심으로부터 하트 크기의 절반만큼 이동
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 4); // 시작점 설정
        ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, size / 4); // 왼쪽 위 커브
        ctx.bezierCurveTo(0, size / 2, size / 2, size * 3 / 4, size / 2, size); // 왼쪽 아래 커브
        ctx.bezierCurveTo(size / 2, size * 3 / 4, size, size / 2, size, size / 4); // 오른쪽 아래 커브
        ctx.bezierCurveTo(size, 0, size / 2, 0, size / 2, size / 4); // 오른쪽 위 커브
        ctx.fillStyle = color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.fill(); // 채우기
        ctx.stroke();
        ctx.closePath(); // 경로 닫기
        ctx.restore(); // 변형 상태를 이전 상태로 복원
    }

    // 캔버스의 가로 중앙과 세로 중앙 계산
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    // 원의 반지름
    var circleRadius = 5;

    // 원 객체 생성 함수
    function createCircle() {
        // 캔버스의 외부 영역에서 랜덤한 좌표 생성
        var x = Math.random() * canvas.width;
        var y = Math.random() * canvas.height;
        // 캔버스의 중심에서 떨어진 거리에 따라 좌표를 캔버스의 외부로 이동
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -canvas.width : canvas.width * 1.5;
        } else {
            y = Math.random() < 0.5 ? -canvas.height : canvas.height * 1.5;
        }
        // 랜덤한 속도 설정 (-2부터 2 사이의 값)
        var speedX = Math.random() * 4 - 2;
        var speedY = Math.random() * 4 - 2;
        circles.push({
            x: x, // x 좌표
            y: y, // y 좌표
            speedX: speedX, // x 방향 속도
            speedY: speedY, // y 방향 속도
            color: '#' + Math.floor(Math.random() * 16777215).toString(16) // 랜덤한 색상
        });
    }

    // 원 객체 생성 함수를 5초마다 호출
    setInterval(createCircle, 1000);

    // 원 객체 배열
    var circles = [];
    var rotation = 0;

    // 애니메이션 프레임 함수
    function animate() {
        // 캔버스를 지우고 다시 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 하트를 그리고 회전
        drawAndRotateHeart();
        drawStar(starX, starY, 50, 5, 'yellow');
        // 모든 원 이동 및 그리기
        circles.forEach(function(circle, index) {
            // 캔버스의 정중앙으로 이동
            var deltaX = centerX - circle.x;
            var deltaY = centerY - circle.y;
            var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            // 원의 현재 위치에 일정 비율의 이동 거리를 더하여 이동
            circle.x += (deltaX / distance) * 4; // 2배의 이동 속도
            circle.y += (deltaY / distance) * 4; // 2배의 이동 속도

            // 원이 캔버스의 정중앙에 도착했는지 확인
            if (Math.abs(circle.x - centerX) < circleRadius && Math.abs(circle.y - centerY) < circleRadius) {
                // 도착한 원을 배열에서 제거하여 사라지게 만듦
                circles.splice(index, 1);
                return; // 해당 원이 사라졌으므로 더 이상의 처리는 필요하지 않음
            }

            // 원 그리기
            drawCircle(circle.x, circle.y, circleRadius, circle.color);
        });
        rotation += Math.PI / 100;
        requestAnimationFrame(animate); // 다음 프레임 요청
    }

    // 시계방향 회전 각도
    var rotation = 0;

    // 애니메이션 시작 함수
    function startAnimation() {      
        animate(); // 애니메이션 시작
    }

    document.getElementById('startbtn').addEventListener('click', function() {
        startAnimation(); // 애니메이션 시작
        this.style.display = 'none'; // 버튼 숨김
        var t = document.getElementById('text');
        t.style.display = 'none'; // 텍스트 숨김
    });