import { defineStore } from 'pinia'

/**
 * 用户角色常量定义
 * 用于统一管理系统中的用户角色类型
 */
export const USER_ROLES = {
  BUYER: 'buyer',   // 买家角色
  SELLER: 'seller', // 卖家角色
  ADMIN: 'admin'    // 管理员角色
}

/**
 * 用户状态管理存储
 * 管理用户的登录状态、角色权限等信息
 */
export const useUserStore = defineStore('user', {
  // 状态定义：管理用户数据和登录状态
  state: () => ({
    // 从localStorage获取当前用户信息，如果不存在则为null
    currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    // 根据localStorage中是否有用户信息判断登录状态
    isLoggedIn: !!localStorage.getItem('currentUser')
  }),
  
  // 计算属性：根据用户数据派生的状态
  getters: {
    // 获取当前用户角色
    userRole: (state) => state.currentUser?.role || null,
    // 判断是否为买家
    isBuyer: (state) => state.currentUser?.role === 'buyer',
    // 判断是否为卖家
    isSeller: (state) => state.currentUser?.role === 'seller',
    // 判断是否为管理员
    isAdmin: (state) => state.currentUser?.role === 'admin'
  },
  
  // 操作方法：修改状态的函数
  actions: {
    /**
     * 用户登录
     * @param {Object} userData - 用户数据对象，包含用户名、密码、角色等信息
     */
    login(userData) {
      // 检查用户是否被禁用
      if (userData.active === false) {
        throw new Error('账号已被禁用');
      }
      
      // 如果没有id字段，生成唯一ID
      if (!userData.id) {
        const timestamp = Date.now();
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        userData.id = `U${timestamp}_${randomPart}`;
      }
      
      // 保存用户数据到本地存储
      localStorage.setItem('currentUser', JSON.stringify(userData));
      // 更新状态
      this.currentUser = userData;
      this.isLoggedIn = true;
      
      // 注意：这里没有直接导入其他store来初始化购物车和订单数据
      // 避免循环依赖问题，相关初始化将在组件中手动调用
    },
    
    /**
     * 用户登出
     */
    logout() {
      // 清除本地存储中的用户数据
      localStorage.removeItem('currentUser');
      // 更新状态
      this.currentUser = null;
      this.isLoggedIn = false;
    },
    
    /**
     * 检查用户状态
     * 用于验证当前登录用户是否仍然有效
     */
    checkUserStatus() {
      if (!this.currentUser) return;
      
      try {
        // 从本地存储获取最新的用户列表
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // 查找当前用户
        const currentUserInList = users.find(u => u.id === this.currentUser.id);
        
        // 如果用户不存在或已被禁用，则强制登出
        if (!currentUserInList || currentUserInList.active === false) {
          this.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('检查用户状态失败:', error);
        return true; // 出错时默认不处理
      }
    },
    
    /**
     * 更新用户信息
     * @param {Object} userData - 需要更新的用户数据字段
     */
    updateUserInfo(userData) {
      // 合并现有用户数据和新数据
      const updatedUser = { ...this.currentUser, ...userData };
      // 更新本地存储
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      // 更新状态
      this.currentUser = updatedUser;
    },

    /**
     * 获取所有用户数据
     * 从localStorage加载所有用户数据
     * @returns {Array} - 所有用户的数组，如果不存在则返回空数组
     */
    loadAllUsers() {
      try {
        // 从localStorage获取所有用户数据
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users;
      } catch (error) {
        console.error('加载用户数据失败:', error);
        return [];
      }
    }
  }
}) 