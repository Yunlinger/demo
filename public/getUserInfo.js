const api = require('./request.js');


function getUserInfo(username) {

  return new Promise((resolve, reject) => {
    var url = "https://www.tiktok.com/@" + username;
    api.get(url, {
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => {
      const jsonMatch = res.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.+?)<\/script>/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        // console.log("JSON 数据: ", jsonData.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.user)
        //提取所需信息
        const userInfo = jsonData.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.user;
        const avatarLarger = userInfo.avatarLarger       
        resolve({ avatarLarger })
      } else {
        reject("获取用户信息失败")
      }
    }).catch(err => {
      reject("获取用户信息失败:" + err)
    })
  })
}
module.exports = { getUserInfo };