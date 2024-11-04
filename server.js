const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { log } = require('console');
const readline = require('readline');
const { userInfo } = require('os');
const { getUserInfo } =require('./public/getUserInfo.js')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.static(path.join(__dirname, './public')));
const PORT = process.env.PORT || 3000;
const userLikes = {}; // 存储每个用户的点赞次数
server.listen(PORT, () => {
  console.log("游戏已运行！浏览器打开：http://localhost:3000");
  
      // 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入 TikTok 用户名
rl.question('请输入你的 TikTok 用户名（请确保直播间已经开启）: ', (tiktokUsername) => {

  const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

  let balls = {};
  const gridSize = 20; // 每个网格块的大小（像素）
  const rows = Math.floor(540 / gridSize);
  const cols = Math.floor(540 / gridSize);

  // 定义全局的 regions
  const regions = {
      'female': 0,
      'male': 1

  };


  tiktokLiveConnection.connect().then(state => {
      console.info(`成功连接到 TikTok 直播间: ${state.roomId}`);
      
  }).catch(err => {
      console.error('Failed to connect', err);
  });

  tiktokLiveConnection.on('chat', data => {
      const username = data.uniqueId;
      const comment = data.comment.toLowerCase();
      const regionIndex = getRegionIndex(comment);
      if (regionIndex !== -1) {
          if (!balls[username]) {
              console.log(username, '加入战斗！');
            balls[username] = createBall(regionIndex, username);
            getUserInfo(username).then(res => {
              broadcast({ type: 'newBall', ball: balls[username] ,avatar: res.avatarLarger});
            })
              
          }
      }
  });

  tiktokLiveConnection.on('gift', data => {
      const username = data.uniqueId;
    const giftId = data.giftId;
    console.log(giftId);
    // 6064 gg
      if (giftId === 5269) { 
          if (balls[username]) {
              if (data.repeatEnd) { // 确保只有在连续发送结束时处理
                  console.log(`${username} 送出礼物：抖音 x${data.repeatCount}`);
                  // 增加用户小球数量
                  for (let i = 0; i < data.repeatCount; i++) {
                      const newBall = createBall(balls[username].regionIndex, username);
                      broadcast({ type: 'newBall', ball: newBall });
                  }
              }
          }
      } else if (giftId === 5655) { // 玫瑰
          if (balls[username]) {
              console.log(username, '送出礼物：🌹！');
              if (data.repeatEnd) {
                  broadcast({ type: 'updateSpeed', username: username, giftId: giftId });
              }
          }
      }
  });
// 在 TikTok Live 事件中处理点赞
  tiktokLiveConnection.on('like', data => {
    const userId = data.uniqueId; // 用户的唯一标识
    const likeCount = data.likeCount;
    // 初始化用户点赞次数
    if (balls[userId]) {
      // 初始化用户点赞次数
      if (!userLikes[userId]) {
          userLikes[userId] = 0;
      }

      // 更新用户点赞次数
      userLikes[userId] += likeCount;

      // 检查用户点赞次数是否达到 50 次
      if (userLikes[userId] >= 50) {
          const regionIndex = balls[userId].regionIndex; // 获取用户的性别阵营
          const newBall = createBall(regionIndex, userId); // 使用 regionIndex 创建小球
          broadcast({ type: 'newBall', ball: newBall });
          userLikes[userId] = 0; // 重置用户点赞次数
      }
  }
  });

  // 获取用户的区域索引（性别）
  function getRegionIndexs (userId) {
    const userInfo=balls[userId]
    
    const genderIndex = userInfo.regionIndex; // 获取用户性别

    if (genderIndex === 1) {
        return 1; // 男性阵营索引
    } else if (genderIndex === 0) {
        return 0; // 女性阵营索引
    }
    return null; // 未知性别
}

  function getRegionIndex(comment) {
      // 将输入转换为小写并去除首尾空格
      const cleanedComment = comment.trim();
      // 返回匹配的值或 -1
      return regions[cleanedComment] !== undefined ? regions[cleanedComment] : -1;
  }

  function createBall(regionIndex, username) {
      const regionCoordinates = [
          { color: 'pink', startX: cols/2, startY: 0 }, // 美国
          { color: '#3490de', startX: cols/2, startY: rows - 1 }, // 日本
      ];
    
    const region = regionCoordinates[regionIndex];

    
      return {
          x: region.startX * gridSize + gridSize / 2,
          y: region.startY * gridSize + gridSize / 2,
          dx: 1,
          dy: 1,
          color: region.color,
          regionIndex: regionIndex,
          territory: [{ x: region.startX, y: region.startY }],
          username: username
      };
  }

  function broadcast(message) {
      wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
          }
      });
  }

  

  // 关闭 readline 接口
  rl.close();
});
    });

