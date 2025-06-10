import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权处理，例如跳转到登录页
      console.log('未授权，请重新登录')
    }
    return Promise.reject(error)
  }
)

// 产品相关接口
export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (keyword) => api.get(`/products/search?q=${keyword}`)
}

// 购物车相关接口
export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (product) => api.post('/cart', product),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  updateQuantity: (productId, quantity) => api.put(`/cart/${productId}`, { quantity })
}

// 订单相关接口
export const orderApi = {
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  payOrder: (orderId, paymentData) => api.post(`/orders/${orderId}/pay`, paymentData)
}

// 用户相关接口
export const userApi = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile')
}

export default api 