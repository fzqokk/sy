import { defineStore } from 'pinia'

// 这里暂时注释掉axios导入，因为目前使用的是模拟数据
// import axios from 'axios'

/**
 * 模拟商品数据
 * 在实际项目中，这些数据应该从API获取
 * 目前使用静态数据进行开发和测试
 */
const mockProducts = [
  {
    id: "P001",
    name: "高品质头戴式耳机",
    price: 299,
    stock: 100,
    category: "电子产品",
    images: [require('@/assets/images/耳机.jpeg')],
    description: "专业级音质，舒适佩戴，适合长时间使用"
  },
  {
    id: "P002",
    name: "机械键盘",
    price: 399,
    stock: 50,
    category: "电子产品",
    images: [require('@/assets/images/键盘.png')],
    description: "机械轴体，RGB背光，游戏玩家首选"
  },
  {
    id: "P003",
    name: "经典条纹衬衫",
    price: 199,
    stock: 200,
    category: "服饰",
    images: [require('@/assets/images/clothes.jpg')],
    description: "优质面料，修身剪裁，商务休闲两相宜"
  },
  {
    id: "P004",
    name: "计算机程序设计艺术",
    price: 499,
    stock: 30,
    category: "图书",
    images: [require('@/assets/images/book.jpg')],
    description: "编程必读经典著作，知识深度与广度兼具"
  }
]

/**
 * 商品状态管理存储
 * 管理产品列表、筛选、排序和搜索功能
 */
export const useProductsStore = defineStore('products', {
  // 状态定义：商品数据和UI状态
  state: () => ({
    products: mockProducts,         // 所有商品列表
    filteredProducts: mockProducts, // 筛选后的商品列表
    loading: false,                 // 加载状态
    error: null,                    // 错误信息
    loaded: false,                  // 标记是否已从本地存储加载过数据
    deletedProducts: []             // 已删除商品列表
  }),
  
  // 计算属性
  getters: {
    /**
     * 通过ID获取特定商品
     * @param {string} id - 商品ID
     * @returns {Object|undefined} - 返回找到的商品对象，如果不存在则返回undefined
     */
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    }
  },
  
  // 操作方法
  actions: {
    /**
     * 获取所有商品数据
     * 优先从本地存储获取，如果不存在则使用模拟数据
     * @returns {Promise} - 返回Promise以支持异步操作
     */
    async fetchProducts() {
      this.loading = true
      
      // 返回一个Promise以便正确处理异步
      return new Promise((resolve, reject) => {
        try {
          // 尝试从本地存储加载数据
          if (this.loadFromLocalStorage()) {
            this.loaded = true
            this.loading = false
            resolve(this.products)
            return
          }
          
          // 如果本地没有数据，使用模拟数据
          setTimeout(() => {
            this.products = mockProducts
            this.filteredProducts = mockProducts
            this.saveToLocalStorage()  // 保存到本地存储
            this.loaded = true
            this.loading = false
            resolve(mockProducts)
          }, 500)
        } catch (error) {
          // 记录错误并更新状态
          this.error = error.message
          this.loading = false
          reject(error)
        }
      })
    },
    
    /**
     * 根据关键词搜索商品
     * 在商品名称和描述中查找匹配项
     * @param {string} keyword - 搜索关键词
     */
    searchProducts(keyword) {
      if (!keyword) {
        // 如果关键词为空，显示所有商品
        this.filteredProducts = this.products
        return
      }
      
      // 搜索名称和描述中包含关键词的商品（不区分大小写）
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.description.toLowerCase().includes(keyword.toLowerCase())
      )
    },
    
    /**
     * 按分类筛选商品
     * @param {string} category - 分类名称
     */
    filterByCategory(category) {
      if (!category || category === '全部') {
        // 如果没有指定分类或选择"全部"，显示所有商品
        this.filteredProducts = this.products
        return
      }
      
      // 筛选指定分类的商品
      this.filteredProducts = this.products.filter(product => 
        product.category === category
      )
    },
    
    /**
     * 按价格排序商品
     * @param {string} order - 排序方式：'asc'升序，'desc'降序
     */
    sortByPrice(order) {
      // 创建新数组进行排序，避免直接修改原数组
      this.filteredProducts = [...this.filteredProducts].sort((a, b) => {
        return order === 'asc' ? a.price - b.price : b.price - a.price
      })
    },
    
    /**
     * 添加新商品
     * @param {Object} productData - 商品数据
     * @returns {Object} - 返回新添加的商品
     */
    addProduct(productData) {
      // 生成唯一ID - 查找最大ID并+1，而不是基于数组长度
      let maxId = 0;
      this.products.forEach(product => {
        const idNum = parseInt(product.id.replace('P', ''));
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      });
      
      // 考虑已删除商品中的ID
      this.deletedProducts.forEach(product => {
        const idNum = parseInt(product.id.replace('P', ''));
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      });
      
      const newId = `P${String(maxId + 1).padStart(3, '0')}`;
      
      // 创建新商品对象
      const newProduct = {
        id: newId,
        name: productData.name,
        price: parseFloat(productData.price) || 0,
        stock: parseInt(productData.stock) || 0,
        category: productData.category || '其他',
        description: productData.description || '',
        images: productData.images || [],
        sales: 0
      }
      
      // 添加到商品列表
      this.products.push(newProduct)
      
      // 更新筛选后的商品列表
      this.filteredProducts = [...this.products]
      
      // 保存到本地存储
      this.saveToLocalStorage()
      
      return newProduct
    },
    
    /**
     * 更新商品信息
     * @param {string} productId - 商品ID
     * @param {Object} updateData - 更新的数据
     * @returns {Object|null} - 返回更新后的商品，如果不存在则返回null
     */
    updateProduct(productId, updateData) {
      const index = this.products.findIndex(p => p.id === productId)
      
      if (index === -1) return null
      
      // 更新商品
      const updatedProduct = {
        ...this.products[index],
        ...updateData
      }
      
      // 确保数字类型正确
      if ('price' in updateData) {
        updatedProduct.price = parseFloat(updateData.price) || 0
      }
      
      if ('stock' in updateData) {
        updatedProduct.stock = parseInt(updateData.stock) || 0
      }
      
      // 更新数组
      this.products[index] = updatedProduct
      
      // 更新筛选后的商品列表
      const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId)
      if (filteredIndex !== -1) {
        this.filteredProducts[filteredIndex] = updatedProduct
      }
      
      // 保存到本地存储
      this.saveToLocalStorage()
      
      // 确保状态更新
      this.products = [...this.products]
      
      return updatedProduct
    },
    
    /**
     * 删除商品
     * @param {string} productId - 商品ID
     * @returns {boolean} - 成功返回true，失败返回false
     */
    deleteProduct(productId) {
      const index = this.products.findIndex(p => p.id === productId)
      
      if (index === -1) return false
      
      // 将要删除的商品添加到已删除商品列表
      this.deletedProducts.push({...this.products[index], deletedAt: new Date().toISOString()})
      
      // 从商品列表中删除
      this.products.splice(index, 1)
      
      // 从筛选后的商品列表中删除
      const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId)
      if (filteredIndex !== -1) {
        this.filteredProducts.splice(filteredIndex, 1)
      }
      
      // 保存到本地存储
      this.saveToLocalStorage()
      this.saveDeletedProductsToLocalStorage()
      
      return true
    },
    
    /**
     * 恢复已删除的商品
     * @param {string} productId - 要恢复的商品ID
     * @returns {boolean} - 恢复成功返回true，失败返回false
     */
    restoreProduct(productId) {
      const deletedIndex = this.deletedProducts.findIndex(p => p.id === productId)
      
      if (deletedIndex === -1) return false
      
      // 从已删除列表中获取商品并移除deletedAt属性
      const productToRestore = { ...this.deletedProducts[deletedIndex] }
      delete productToRestore.deletedAt
      
      // 将商品添加回商品列表
      this.products.push(productToRestore)
      
      // 从已删除列表中移除
      this.deletedProducts.splice(deletedIndex, 1)
      
      // 更新筛选后的商品列表
      this.filteredProducts = [...this.products]
      
      // 保存到本地存储
      this.saveToLocalStorage()
      this.saveDeletedProductsToLocalStorage()
      
      return true
    },
    
    /**
     * 永久删除已下架商品
     * @param {string} productId - 要永久删除的商品ID
     * @returns {boolean} - 删除成功返回true，失败返回false
     */
    permanentlyDeleteProduct(productId) {
      const deletedIndex = this.deletedProducts.findIndex(p => p.id === productId)
      
      if (deletedIndex === -1) return false
      
      // 从已删除列表中移除
      this.deletedProducts.splice(deletedIndex, 1)
      
      // 保存到本地存储
      this.saveDeletedProductsToLocalStorage()
      
      return true
    },
    
    /**
     * 保存商品数据到本地存储
     */
    saveToLocalStorage() {
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    
    /**
     * 保存已删除商品到本地存储
     */
    saveDeletedProductsToLocalStorage() {
      localStorage.setItem('deletedProducts', JSON.stringify(this.deletedProducts))
    },
    
    /**
     * 从本地存储加载商品数据
     */
    loadFromLocalStorage() {
      const storedProducts = localStorage.getItem('products')
      const storedDeletedProducts = localStorage.getItem('deletedProducts')
      
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts)
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            this.products = parsedProducts
            this.filteredProducts = parsedProducts
            this.loaded = true
            
            // 同时加载已删除商品
            if (storedDeletedProducts) {
              const parsedDeletedProducts = JSON.parse(storedDeletedProducts)
              if (Array.isArray(parsedDeletedProducts)) {
                this.deletedProducts = parsedDeletedProducts
              }
            }
            
            return true
          }
        } catch (error) {
          console.error('解析本地商品数据失败:', error)
        }
      }
      return false
    }
  }
}) 