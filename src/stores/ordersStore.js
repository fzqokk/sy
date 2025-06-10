import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import { useCartStore } from './cartStore'
import { useProductsStore } from './productsStore'

/**
 * 订单状态管理存储
 * 管理用户订单的创建、支付和查询等操作
 */
export const useOrdersStore = defineStore('orders', {
  // 状态定义：订单数据和UI状态
  state: () => ({
    ordersMap: {}, // 按用户ID存储订单，格式为：{userId1: [order1, order2], userId2: [order3, order4]}
    loading: false, // 加载状态
    error: null     // 错误信息
  }),
  
  // 计算属性
  getters: {
    /**
     * 获取当前登录用户的所有订单
     * @returns {Array} 当前用户的订单数组，未登录时返回空数组
     */
    userOrders: (state) => {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) return []
      
      const userId = userStore.currentUser.id
      return state.ordersMap[userId] || []
    },
    
    /**
     * 获取当前用户的订单数量
     * @returns {number} 订单数量
     */
    orderCount: (state) => {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) return 0
      
      const userId = userStore.currentUser.id
      return (state.ordersMap[userId] || []).length
    }
  },
  
  // 操作方法
  actions: {
    /**
     * 初始化订单数据
     * 从localStorage读取订单数据
     */
    initOrdersData() {
      try {
        // 从localStorage获取全部订单数据
        const storedOrders = JSON.parse(localStorage.getItem('ordersMap') || 'null')
        if (storedOrders) {
          this.ordersMap = storedOrders
        } else {
          // 首次使用时初始化空对象
          this.ordersMap = {}
          this.saveToLocalStorage()
        }
      } catch (error) {
        console.error('初始化订单数据失败:', error)
        this.ordersMap = {}
        this.saveToLocalStorage()
      }
    },
    
    /**
     * 获取当前用户的订单数据
     * @returns {Promise} 返回包含用户订单的Promise
     */
    async fetchOrders() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) return []
      
      this.loading = true
      
      // 返回一个Promise以便正确处理异步
      return new Promise((resolve, reject) => {
        try {
          // 实际项目中，这里应该是API调用
          // const response = await axios.get('/orders')
          // this.orders = response.data
          
          // 确保已初始化订单数据
          if (Object.keys(this.ordersMap).length === 0) {
            this.initOrdersData()
          }
          
          // 使用延迟模拟网络请求
          setTimeout(() => {
            // 初始化当前用户的订单数组（如果不存在）
            const userId = userStore.currentUser.id
            if (!this.ordersMap[userId]) {
              this.ordersMap[userId] = []
              this.saveToLocalStorage()
            }
            
            this.loading = false
            resolve(this.userOrders)
          }, 500)
        } catch (error) {
          this.error = error.message
          this.loading = false
          reject(error)
        }
      })
    },
    
    /**
     * 创建新订单
     * @param {Object} addressData - 包含地址和支付方式信息
     * @param {Object} addressData.address - 收货地址信息
     * @param {string} addressData.paymentMethod - 支付方式
     * @returns {Promise} 返回包含新订单的Promise
     */
    async createOrder(addressData) {
      const userStore = useUserStore()
      const cartStore = useCartStore()
      
      console.log('创建订单检查:', {
        isLoggedIn: userStore.isLoggedIn,
        userId: userStore.currentUser?.id,
        cartEmpty: cartStore.isEmpty,
        cartItems: cartStore.items.length,
        addressData
      })
      
      // 验证用户登录状态和用户ID
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) {
        console.error('用户未登录或ID无效')
        return Promise.reject('用户未登录或ID无效')
      }
      
      // 检查是否有结算商品或购物车商品
      const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]')
      console.log('从本地存储获取结算商品:', checkoutItems.length > 0)
      
      if (cartStore.isEmpty && checkoutItems.length === 0) {
        console.error('购物车为空且没有结算商品')
        return Promise.reject('没有可结算的商品')
      }
      
      this.loading = true
      const userId = userStore.currentUser.id
      
      // 返回一个Promise以便正确处理异步
      return new Promise((resolve, reject) => {
        // 实际项目中，这里应该是API调用
        setTimeout(() => {
          try {
            // 确保用户的订单数组已初始化
            if (!this.ordersMap[userId]) {
              this.ordersMap[userId] = []
            }
            
            // 使用结算商品或购物车商品
            const items = checkoutItems.length > 0 ? [...checkoutItems] : [...cartStore.items]
            
            if (items.length === 0) {
              throw new Error('没有可结算的商品')
            }
            
            // 计算订单总价
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            
            // 创建新订单对象
            const newOrder = {
              id: `O${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
              userId: userId,
              items: items,
              total: total,
              status: "待支付",
              createdAt: new Date().toISOString(),
              address: addressData.address,
              paymentMethod: addressData.paymentMethod
            }
            
            console.log('创建的新订单:', {
              id: newOrder.id,
              userId: newOrder.userId,
              items: newOrder.items.length,
              total: newOrder.total
            })
            
            // 添加到用户的订单数组中
            this.ordersMap[userId].push(newOrder)
            this.saveToLocalStorage()
            
            // 清理购物车中的已结算商品
            if (checkoutItems.length > 0) {
              // 使用结算商品列表，从购物车中移除对应商品
              const checkoutIds = checkoutItems.map(item => item.id)
              
              console.log('从购物车中移除已结算商品:', checkoutIds)
              
              // 对购物车中的每个商品检查是否在结算列表中
              checkoutIds.forEach(id => {
                const cartItemIndex = cartStore.items.findIndex(item => item.id === id)
                if (cartItemIndex !== -1) {
                  console.log(`移除购物车中的商品: ${id}`)
                  cartStore.removeItem(id)
                }
              })
            } else {
              // 使用整个购物车结算，直接清空购物车
              console.log('清空整个购物车')
              cartStore.clearCart()
            }
            
            this.loading = false
            resolve(newOrder)
          } catch (error) {
            console.error('创建订单失败:', error)
            this.loading = false
            reject(error)
          }
        }, 800)
      })
    },
    
    /**
     * 支付订单
     * @param {string} orderId - 要支付的订单ID
     * @returns {Promise} 返回包含已支付订单的Promise
     */
    async payOrder(orderId) {
      const userStore = useUserStore()
      const productsStore = useProductsStore()
      
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) {
        console.error('支付失败：用户未登录')
        return Promise.reject('用户未登录')
      }
      
      this.loading = true
      const userId = userStore.currentUser.id
      
      console.log('开始处理支付订单:', {
        orderId,
        userId,
        hasOrdersMap: !!this.ordersMap[userId]
      })
      
      return new Promise((resolve, reject) => {
        // 模拟支付处理过程
        setTimeout(() => {
          // 确保用户的订单数组已初始化
          if (!this.ordersMap[userId]) {
            console.error('支付失败：用户没有订单记录')
            this.loading = false
            reject('用户没有订单')
            return
          }
          
          // 找到对应订单并更新状态
          const orderIndex = this.ordersMap[userId].findIndex(order => order.id === orderId)
          
          console.log('订单查询结果:', {
            orderId,
            orderFound: orderIndex !== -1,
            orderIndex
          })
          
          if (orderIndex !== -1) {
            // 获取订单
            const order = this.ordersMap[userId][orderIndex];
            
            // 更新订单状态为已付款，记录支付时间
            this.ordersMap[userId][orderIndex].status = "已付款"
            this.ordersMap[userId][orderIndex].paidAt = new Date().toISOString()
            
            // 更新商品库存
            if (order.items && order.items.length > 0) {
              console.log('正在更新商品库存...');
              
              order.items.forEach(item => {
                // 查找商品
                const product = productsStore.getProductById(item.id);
                if (product) {
                  // 计算新库存
                  const newStock = Math.max(0, product.stock - item.quantity);
                  console.log(`商品 ${item.id} - ${item.name} 库存更新: ${product.stock} -> ${newStock}`);
                  
                  // 更新商品库存
                  productsStore.updateProduct(item.id, {
                    stock: newStock
                  });
                }
              });
              
              // 强制刷新商品数据，确保视图更新
              productsStore.products = [...productsStore.products];
            }
            
            this.saveToLocalStorage()
            
            console.log('订单支付成功:', this.ordersMap[userId][orderIndex])
            
            // 通知后端支付成功
            // 实际应用中这里应该调用支付API
            
            this.loading = false
            resolve(this.ordersMap[userId][orderIndex])
          } else {
            console.error('支付失败：订单不存在或无权操作')
            this.loading = false
            reject('订单不存在或无权操作')
          }
        }, 800)
      })
    },
    
    /**
     * 获取指定ID的订单
     * 确保只能获取当前登录用户的订单
     * @param {string} orderId - 订单ID
     * @returns {Object|null} 找到的订单对象，如不存在则返回null
     */
    getOrderById(orderId) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.currentUser?.id) return null
      
      const userId = userStore.currentUser.id
      if (!this.ordersMap[userId]) return null
      
      return this.ordersMap[userId].find(order => order.id === orderId) || null
    },
    
    /**
     * 更新订单状态
     * @param {string} orderId - 订单ID
     * @param {string} status - 新的订单状态
     * @returns {Promise} 返回包含更新后订单的Promise
     */
    async updateOrderStatus(orderId, status) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        console.error('更新订单状态失败：用户未登录')
        return Promise.reject('用户未登录')
      }
      
      this.loading = true
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // 确保订单数据已初始化
            if (Object.keys(this.ordersMap).length === 0) {
              this.initOrdersData()
            }
            
            // 作为卖家用户，可以更新任何用户的订单
            let updatedOrder = null
            let foundOrderUserId = null
            
            // 遍历所有用户的订单
            for (const userId in this.ordersMap) {
              const orderIndex = this.ordersMap[userId].findIndex(order => order.id === orderId)
              
              if (orderIndex !== -1) {
                // 找到订单并更新状态
                this.ordersMap[userId][orderIndex].status = status
                
                // 根据状态更新相应的时间戳
                if (status === 'shipped' || status === '已发货') {
                  this.ordersMap[userId][orderIndex].shippedAt = new Date().toISOString()
                } else if (status === 'delivered' || status === '已送达') {
                  this.ordersMap[userId][orderIndex].deliveredAt = new Date().toISOString()
                } else if (status === 'completed' || status === '已完成') {
                  this.ordersMap[userId][orderIndex].completedAt = new Date().toISOString()
                }
                
                updatedOrder = this.ordersMap[userId][orderIndex]
                foundOrderUserId = userId
                break
              }
            }
            
            if (updatedOrder) {
              // 保存到本地存储
              this.saveToLocalStorage()
              
              console.log('订单状态更新成功:', {
                orderId,
                userId: foundOrderUserId,
                newStatus: status,
                order: updatedOrder
              })
              
              this.loading = false
              resolve(updatedOrder)
            } else {
              throw new Error('订单不存在')
            }
          } catch (error) {
            console.error('更新订单状态失败:', error)
            this.loading = false
            reject(error.message || '订单不存在或无权操作')
          }
        }, 300)
      })
    },
    
    /**
     * 清理指定用户的所有订单数据
     * @param {Object} user - 用户对象，包含id和username
     * @returns {boolean} - 是否成功清理
     */
    clearUserOrders(user) {
      if (!user) return false;
      
      try {
        let deleted = false;
        
        // 删除基于用户ID的订单
        if (user.id && this.ordersMap[user.id]) {
          delete this.ordersMap[user.id];
          deleted = true;
        }
        
        // 删除基于用户名的订单（兼容旧数据）
        if (user.username && this.ordersMap[user.username]) {
          delete this.ordersMap[user.username];
          deleted = true;
        }
        
        if (deleted) {
          this.saveToLocalStorage();
        }
        
        return deleted;
      } catch (error) {
        console.error('清理用户订单数据失败:', error);
        return false;
      }
    },
    
    /**
     * 保存订单数据到本地存储
     * 在每次修改订单后调用
     */
    saveToLocalStorage() {
      localStorage.setItem('ordersMap', JSON.stringify(this.ordersMap))
    },
    
    /**
     * 清理订单数据
     * 用户退出登录时调用，清空内存中的数据
     */
    clearOrdersData() {
      // 不删除localStorage中的数据，只清空内存中的数据
      this.ordersMap = {}
      this.loading = false
      this.error = null
    }
  }
}) 