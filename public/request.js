const axios = require('axios')
const apiClient = axios.create({
  baseURL: '', // 替换为你的 API 基础 URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如添加认证 token
    // const token = localStorage.getItem('token');
    // if (token) {
    //     config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data; // 根据需求调整返回数据格式
  },
  (error) => {
    // 处理请求错误
    // 这里可以根据状态码进行相应的错误处理
    return Promise.reject(error);
  }
);

// 封装 GET 请求
const get = (url, params = {}) => {
  return apiClient.get(url, { params });
};

// 封装 POST 请求
const post = (url, data = {}) => {
  return apiClient.post(url, data);
};

// 封装 PUT 请求
const put = (url, data = {}) => {
  return apiClient.put(url, data);
};

// 封装 DELETE 请求
const del = (url) => {
  return apiClient.delete(url);
};

// 导出封装的方法
module.exports = {
  get,
  post,
  put,
  del,
};