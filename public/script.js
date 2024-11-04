
document.addEventListener('DOMContentLoaded', function () {
  // 加载各国的国旗图像
const ballImages = {
  0: new Image(), // 美国
  1: new Image() // 日本

};
  
  
  
  //弹窗CSS 样式！！！！！！jj
const style = document.createElement('style');
style.textContent = `
  .user-join-prompt {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 16px; /* 增加上下内边距和左右内边距 */
    background-color: rgba(0, 0, 0, 0.8); /* 稍微加深背景色 */
    color: white;
    border-radius: 10px; /* 圆角更大一些 */
    display: flex;
    align-items: center;
    gap: 12px; /* 增加头像与文本之间的间距 */
    font-size: 16px; /* 字体大小增加 */
    opacity: 0;
    animation: fadeInOut 12s forwards;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  }
  .user-join-prompt .avatar {
    width: 40px; /* 增加头像的大小 */
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5); /* 添加头像边框 */
  }
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
  }
`;

document.head.appendChild(style);
  // 加载音效
const territorySound = new Audio('12457.mp3');

// 设置国旗图片的源
ballImages[0].src = 'female.png';
ballImages[1].src = 'male.png';
  const socket = new WebSocket('ws://localhost:3000');
  const balls = {}; // 使用对象存储每个用户的小球数组

  // ws 监听后端发来的消息
  socket.addEventListener('message', function (event) {
      const data = JSON.parse(event.data);
      
    if (data.type === 'updateSpeed') {
        
          if (data.giftId === 5655) { // 玫瑰
            const username = data.username;
            console.log(balls);            
              // 遍历用户的所有小球，更新其速度
            if (balls[username]) {
                  balls[username].forEach(ball => {
                    ball.dx += (ball.dx > 0 ? 0.1 : -0.1);
                    ball.dy += (ball.dy > 0 ? 0.1 : -0.1);
                  });
              }
          }
      } else if (data.type === 'newBall') {
      const username = data.ball.username;
      const avatarImg = data.avatar
          // 如果用户还没有小球，初始化为数组
          if (!balls[username]) {
              balls[username] = [];
          }
      const avatarImage = new Image();
      avatarImage.crossOrigin = "Anonymous";
          avatarImage.src = avatarImg;
          // 将新小球添加到用户的小球数组中
          balls[username].push(data.ball);
      
      showUserJoinPrompt(username, avatarImg);
      console.log(avatarImg);
        
      
      console.log(balls);
      
      }
  });

  const backgroundMusic = document.getElementById('backgroundMusic');
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const ballRadius = 10;
  const gridSize = 20;
  const rows = Math.floor(canvas.height / gridSize);
  const cols = Math.floor(canvas.width / gridSize);
  const runButton = document.getElementById('runButton');
  const territories = {
      0: [],  // 美国
      1: [],  // 日本

  };

  const regions = [
    { color: 'pink', startX: cols /2, startY: 0 }, // 女角色
    { color: '#3490de', startX: cols/2, startY: rows - 1 }   // 男角色
];

  let grid = Array(rows).fill(null).map(() => Array(cols).fill(null));

  const ballImage = new Image();
  ballImage.src = 'USA_flag.jpeg';

  function randomizeDirection(ball) {
      const angleVariation = (Math.random() - 0.5) * Math.PI / 6; // ±15度
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

      const currentAngle = Math.atan2(ball.dy, ball.dx);
      const newAngle = currentAngle + angleVariation;

      ball.dx = speed * Math.cos(newAngle);
      ball.dy = speed * Math.sin(newAngle);
  }
  function showUserJoinPrompt(username, avatarUrl) {
    const promptDiv = document.createElement('div');
    promptDiv.className = 'user-join-prompt';
    promptDiv.innerHTML = `
      <img src="${avatarUrl}" alt="${username}" class="avatar">
      <span>${username} joined!</span>
    `;
    document.body.appendChild(promptDiv);

    // 2秒后自动隐藏并删除提示框
    setTimeout(() => {
      promptDiv.remove();
    }, 10000);
  }

  function drawRegions() {
      for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
              ctx.fillStyle = grid[i][j] || 'white';
              ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
              ctx.strokeStyle = '#7c7575';
              ctx.lineWidth = 1;
              ctx.strokeRect(j * gridSize, i * gridSize, gridSize, gridSize);
          }
      }
  }

  function checkCollision(ball1, ball2) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionDistance = ballRadius * 2 + 4;

    if (distance < collisionDistance) {
        // 计算单位法向量
        const overlap = collisionDistance - distance;
        const nx = dx / distance; // x 方向的法向量
        const ny = dy / distance; // y 方向的法向量

        // 将小球位置修正，避免重叠
        ball1.x += nx * (overlap / 2);
        ball1.y += ny * (overlap / 2);
        ball2.x -= nx * (overlap / 2);
        ball2.y -= ny * (overlap / 2);

        // 翻转速度
        ball1.dx = -ball1.dx;
        ball1.dy = -ball1.dy;
        ball2.dx = -ball2.dx;
        ball2.dy = -ball2.dy;
    }
}


  regions.forEach((region, index) => {
      grid[region.startY][region.startX] = region.color;
      territories[index].push({ x: region.startX, y: region.startY });
      balls[`initialBall${index}`] = [{
          x: region.startX * gridSize + gridSize / 2,
          y: region.startY * gridSize + gridSize / 2,
          dx: 1 * (index % 2 === 0 ? 1 : -1),
          dy: 1 * (index < 2 ? 1 : -1),
          color: region.color,
          regionIndex: index
      }];
  });





 //这里进行画图！！！！！ jj
  function drawBall(ball) {
    ctx.save(); // 保存当前状态

    // 定义圆形裁剪区域
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); // 裁剪区域

    // 获取国旗图像和尺寸
    const img = ballImages[ball.regionIndex];
    const scaleFactor = 1;

    // 计算保持比例的绘制尺寸
    const width = img.naturalWidth;  // 原始宽度
    const height = img.naturalHeight; // 原始高度
    const aspectRatio = width / height;
    

    let drawWidth, drawHeight;

    if (aspectRatio > 1) { // 宽度大于高度
        drawWidth = ballRadius * 2 * scaleFactor; // 固定宽度
        drawHeight = drawWidth / aspectRatio; // 根据宽度计算高度
    } else { // 高度大于或等于宽度
        drawHeight = ballRadius * 2 * scaleFactor; // 固定高度
        drawWidth = drawHeight * aspectRatio; // 根据高度计算宽度
    }
  

    // 绘制图像
    
      ctx.drawImage(img, ball.x - drawWidth / 2, ball.y - drawHeight / 2, drawWidth, drawHeight);
      
    
    ctx.restore(); // 恢复到之前的状态
}


  function updateBall(ball) {
      let gridX = Math.floor(ball.x / gridSize);
      let gridY = Math.floor(ball.y / gridSize);

      if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
          ball.dx = -ball.dx;
          randomizeDirection(ball);
      }

      if (ball.y + ball.dy > canvas.height - ballRadius || ball.y + ball.dy < ballRadius) {
          ball.dy = -ball.dy;
          randomizeDirection(ball);
      }

      let isAtEdge = !territories[ball.regionIndex].some(tile => tile.x === gridX && tile.y === gridY);
      if (isAtEdge) {
          if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
              let currentOwnerColor = grid[gridY][gridX];
              if (currentOwnerColor !== ball.color) {
                  Object.values(balls).flat().forEach(otherBall => {
                      if (otherBall.color === currentOwnerColor) {
                          territories[otherBall.regionIndex] = territories[otherBall.regionIndex].filter(tile => !(tile.x === gridX && tile.y === gridY));
                      }
                  });
                  grid[gridY][gridX] = ball.color;
                  territories[ball.regionIndex].push({ x: gridX, y: gridY });
                  territorySound.currentTime = 0; // 重置音效播放时间
                  territorySound.play();
              }
          }
          ball.dx = -ball.dx;
          ball.dy = -ball.dy;
          randomizeDirection(ball);
      }

      if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) {
          ball.dx = -ball.dx;
          ball.dy = -ball.dy;
          randomizeDirection(ball);
      }

      ball.x += ball.dx;
      ball.y += ball.dy;
  }

  function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRegions();

      const ballArray = Object.values(balls).flat();

      for (let i = 0; i < ballArray.length; i++) {
          for (let j = i + 1; j < ballArray.length; j++) {
            if (ballArray[i].regionIndex === ballArray[j].regionIndex) {
              checkCollision(ballArray[i], ballArray[j]);
          }
          }
      }

      ballArray.forEach(ball => {
          drawBall(ball);
          updateBall(ball);
      });
  }

  function startGame () {
    
      backgroundMusic.play().catch(function (error) {
          console.log("自动播放受限:", error);
      });
    setInterval(draw, 10);
  }
  


  document.getElementById("runButton").addEventListener("click", function () {
    startGame();
    runButton.style.display = 'none';
      this.disabled = true;
  });
  
  
});
