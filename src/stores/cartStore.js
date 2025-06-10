import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

/**
 * 购物车状态管理存储
 * 管理用户的购物车商品、数量和总价等信息
 */
export const useCartStore = defineStore('cart', {
  // 状态定义：购物车商品列表
  state: () => ({
    // 从localStorage获取购物车数据，如果不存在则为空数组
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
  }),
  
  // 计算属性：基于购物车状态派生的数据
  getters: {
    // 获取购物车商品数量
    count: (state) => state.items.length,
    
    // 计算购物车总价
    total: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },
    
    // 判断购物车是否为空
    isEmpty: (state) => state.items.length === 0
  },
  
  // 操作方法：修改购物车状态的函数
  actions: {
    /**
     * 添加商品到购物车
     * @param {Object} product - 商品对象
     * @param {number} quantity - 添加的数量，默认为1
     * @returns {boolean} - 是否添加成功
     */
    addItem(product, quantity = 1) {
      const userStore = useUserStore()
      
      // 检查用户是否登录，未登录则不能添加商品
      if (!userStore.isLoggedIn) {
        // 这里可以触发登录提示
        return false
      }
      
      // 检查商品是否有足够的库存
      if (product.stock !== undefined && product.stock < quantity) {
        console.warn(`商品 ${product.id} 库存不足，当前库存: ${product.stock}, 请求数量: ${quantity}`);
        return false;
      }
      
      // 检查购物车中是否已存在该商品
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // 如果商品已存在，增加数量
        const newQuantity = existingItem.quantity + quantity;
        
        // 再次检查总数量是否超过库存
        if (product.stock !== undefined && newQuantity > product.stock) {
          console.warn(`添加后总数量超过库存限制，当前库存: ${product.stock}, 已有数量: ${existingItem.quantity}, 新增数量: ${quantity}`);
          // 将数量设置为最大可用库存
          existingItem.quantity = product.stock;
          this.saveToLocalStorage();
          return false;
        }
        
        existingItem.quantity = newQuantity;
      } else {
        // 如果商品不存在，添加新商品
        this.items.push({
          ...product,
          quantity
        })
      }
      
      // 保存更新后的购物车到本地存储
      this.saveToLocalStorage()
      return true
    },
    
    /**
     * 从购物车中移除商品
     * @param {string|number} productId - 要移除的商品ID
     */
    removeItem(productId) {
      // 查找商品在购物车中的索引
      const index = this.items.findIndex(item => item.id === productId)
      if (index !== -1) {
        // 从购物车数组中移除该商品
        this.items.splice(index, 1)
        // 更新本地存储
        this.saveToLocalStorage()
      }
    },
    
    /**
     * 更新购物车中商品的数量
     * @param {Object} params - 更新参数
     * @param {string|number} params.productId - 商品ID
     * @param {number} params.quantity - 新的数量
     * @param {number} params.maxStock - 最大库存限制
     * @returns {boolean} - 是否更新成功
     */
    updateQuantity(params) {
      const { productId, quantity, maxStock } = params;
      
      // 查找购物车中的商品
      const item = this.items.find(item => item.id === productId);
      if (!item) return false;
      
      // 如果提供了最大库存限制，则检查数量是否超过限制
      if (maxStock !== undefined && quantity > maxStock) {
        // 如果超过限制，将数量设置为最大库存
        item.quantity = maxStock;
      } else {
        // 否则使用请求的数量
        item.quantity = quantity;
      }
      
        // 更新本地存储
      this.saveToLocalStorage();
      return true;
    },
    
    /**
     * 清空购物车
     */
    clearCart() {
      // 重置购物车为空数组
      this.items = []
      // 更新本地存储
      this.saveToLocalStorage()
    },
    
    /**
     * 保存购物车数据到本地存储
     * 在每次修改购物车后调用
     */
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    }
  }
}) 