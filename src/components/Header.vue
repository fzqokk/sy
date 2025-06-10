<template>
  <div class="header">
    <el-menu
      mode="horizontal"
      :router="false"
      class="menu"
      background-color="transparent"
      text-color="var(--gray-800)"
      active-text-color="var(--primary-color)">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <div class="logo-text">
              <span class="logo-main">fzq的小商城</span>
              <span class="logo-sub">超爽购物体验</span>
            </div>
          </router-link>
        </div>
        
        <div class="search-container">
          <el-input
            v-model="keyword"
            placeholder="搜索商品..."
            prefix-icon="el-icon-search"
            @keyup.enter="handleSearch"
            clearable
            class="search-input">
          </el-input>
        </div>
        
        <div class="menu-items">
          <el-menu-item @click="navigateTo('/')">
            <i class="el-icon-s-home"></i> 首页
          </el-menu-item>
          <el-menu-item @click="navigateTo('/products')">
            <i class="el-icon-menu"></i> 全部商品
          </el-menu-item>
          <el-menu-item @click="handleCartClick">
            <i class="el-icon-shopping-cart-2"></i>
            <el-badge :value="cartCount" class="cart-badge" v-if="cartCount > 0">
              购物车
            </el-badge>
            <span v-else>购物车</span>
          </el-menu-item>
          <el-menu-item @click="handleOrdersClick">
            <i class="el-icon-s-order"></i> 订单中心
          </el-menu-item>
        </div>
        
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="user-profile">
                <div class="user-avatar">{{ user.name ? user.name.substring(0, 1).toUpperCase() : 'U' }}</div>
                <span class="user-name">{{ user.name || '用户' }}</span>
                <i class="el-icon-arrow-down"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard" v-if="!isSeller && !isAdmin">
                    <i class="el-icon-s-home"></i> 用户中心
                  </el-dropdown-item>
                  <el-dropdown-item command="seller" v-if="isSeller">
                    <i class="el-icon-s-shop"></i> 卖家中心
                  </el-dropdown-item>
                  <el-dropdown-item command="admin" v-if="isAdmin">
                    <i class="el-icon-s-tools"></i> 管理后台
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <i class="el-icon-s-order"></i> 我的订单
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <i class="el-icon-switch-button"></i> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <div class="auth-buttons">
              <el-button type="primary" text @click="loginVisible = true" class="login-btn">登录</el-button>
              <div class="divider">|</div>
              <el-button type="primary" text @click="registerVisible = true" class="register-btn">注册</el-button>
            </div>
          </template>
        </div>
      </div>
    </el-menu>
    
    <!-- 登录对话框 -->
    <el-dialog
      title="商城登录"
      v-model="loginVisible"
      width="420px"
      :close-on-click-modal="false"
      :append-to-body="true"
      :destroy-on-close="true"
      :show-close="true"
      custom-class="login-dialog auth-dialog">
      <div class="login-header auth-header">
        <div class="auth-icon">
          <i class="el-icon-user-solid"></i>
        </div>
        <div class="login-title auth-title">账号登录</div>
        <div class="login-subtitle auth-subtitle">欢迎回来，请登录您的账号</div>
      </div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form auth-form">
        <el-form-item prop="username">
          <div class="custom-input">
            <i class="el-icon-user"></i>
            <input 
              v-model="loginForm.username" 
              placeholder="请输入用户名" 
              type="text"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="loginForm.password" 
              placeholder="请输入密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
        <div class="form-actions">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-button type="primary" text class="forgot-password">忘记密码?</el-button>
        </div>
        <el-button type="primary" @click="handleLogin" :loading="isLoading" class="auth-submit-btn">登录</el-button>
      </el-form>
      <div class="auth-footer">
        <div class="register-link auth-switch-link">
          还没有账号? <el-button link @click="switchToRegister">立即注册</el-button>
        </div>
        <el-button class="back-home-btn" @click="goToHome" type="primary" text>
          <i class="el-icon-back"></i> 返回首页
        </el-button>
        <div class="admin-hint">
          <small>管理员账号: admin / 密码: admin123</small>
        </div>
      </div>
    </el-dialog>
    
    <!-- 注册对话框 -->
    <el-dialog
      title="商城登录"
      v-model="registerVisible"
      width="420px"
      :close-on-click-modal="false"
      :append-to-body="true"
      :destroy-on-close="true"
      :show-close="true"
      custom-class="register-dialog auth-dialog">
      <div class="register-header auth-header">
        <div class="auth-icon">
          <i class="el-icon-plus"></i>
        </div>
        <div class="register-title auth-title">创建账号</div>
        <div class="register-subtitle auth-subtitle">注册一个新账号，加入我们</div>
      </div>
      <el-form :model="registerForm" :rules="registerRules" ref="registerForm" class="register-form auth-form">
        <el-form-item prop="username">
          <div class="custom-input">
            <i class="el-icon-user"></i>
            <input 
              v-model="registerForm.username" 
              placeholder="请输入用户名" 
              type="text"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="registerForm.password" 
              placeholder="请输入密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="registerForm.confirmPassword" 
              placeholder="请确认密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="role" label="账号类型">
          <div class="native-radio-group">
            <label class="native-radio" :class="{ active: registerForm.role === 'buyer' }">
              <input 
                type="radio" 
                name="userRole" 
                value="buyer" 
                v-model="registerForm.role"
                class="radio-input">
              <div class="radio-content">
                <i class="el-icon-shopping-cart-2"></i>
                <span>买家</span>
              </div>
            </label>
            <label class="native-radio" :class="{ active: registerForm.role === 'seller' }">
              <input 
                type="radio" 
                name="userRole" 
                value="seller" 
                v-model="registerForm.role"
                class="radio-input">
              <div class="radio-content">
                <i class="el-icon-s-shop"></i>
                <span>卖家</span>
              </div>
            </label>
          </div>
        </el-form-item>
        <div class="form-agreement">
          <el-checkbox v-model="agreeTerms">我已阅读并同意</el-checkbox>
          <el-button type="primary" text class="terms-link">用户协议与隐私政策</el-button>
        </div>
        <el-button type="primary" @click="handleRegister" :loading="isLoading" class="auth-submit-btn">注册</el-button>
      </el-form>
      <div class="auth-footer">
        <div class="login-link auth-switch-link">
          已有账号? <el-button link @click="switchToLogin">立即登录</el-button>
        </div>
        <el-button class="back-home-btn" @click="goToHome" type="primary" text>
          <i class="el-icon-back"></i> 返回首页
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrdersStore } from '@/stores/ordersStore'

export default {
  name: 'TheHeader',
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const router = useRouter()
    
    // 搜索相关
    const keyword = ref('')
    
    // 用户状态
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const user = computed(() => userStore.currentUser || {})
    const isBuyer = computed(() => userStore.isBuyer)
    const isSeller = computed(() => userStore.isSeller)
    const isAdmin = computed(() => userStore.isAdmin)
    
    // 购物车数量
    const cartCount = computed(() => cartStore.count)
    
    // 登录相关
    const loginVisible = ref(false)
    const loginForm = ref({
      username: '',
      password: ''
    })
    const loginRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }
    
    // 表单输入处理函数
    const onLoginInput = (value) => {
      loginForm.value.username = value
    }
    
    const onLoginPasswordInput = (value) => {
      loginForm.value.password = value
    }
    
    const onRegisterInput = (value) => {
      registerForm.value.username = value
    }
    
    const onRegisterPasswordInput = (value) => {
      registerForm.value.password = value
    }
    
    const onRegisterConfirmInput = (value) => {
      registerForm.value.confirmPassword = value
    }
    
    // 登录增强功能
    const rememberMe = ref(false)
    const isLoading = ref(false)
    
    // 注册相关
    const registerVisible = ref(false)
    const registerForm = ref({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'buyer' // 默认为买家角色
    })
    const registerRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: (rule, value, callback) => {
          if (value !== registerForm.value.password) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        }, trigger: 'blur' }
      ]
    }
    
    // 注册增强功能
    const agreeTerms = ref(false)
    
    // 切换登录/注册表单
    const switchToRegister = () => {
      loginVisible.value = false
      registerVisible.value = true
    }
    
    const switchToLogin = () => {
      registerVisible.value = false
      loginVisible.value = true
    }
    
    // 搜索处理
    const handleSearch = () => {
      if (keyword.value.trim()) {
        router.push({ path: '/products', query: { keyword: keyword.value } })
      }
    }
    
    // 处理订单中心点击
    const handleOrdersClick = () => {
      if (!isLoggedIn.value) {
        // 未登录时显示登录框，并设置重定向路径
        loginVisible.value = true
        // 保存重定向路径
        router.push({ path: '/', query: { redirect: '/orders' } })
        ElMessage.warning('请先登录后查看订单')
      } else {
        // 已登录时直接导航到订单页面
        router.push('/orders')
      }
    }
    
    // 处理购物车点击
    const handleCartClick = () => {
      if (!isLoggedIn.value) {
        // 未登录时显示登录框，并设置重定向路径
        loginVisible.value = true
        // 保存重定向路径
        router.push({ path: '/', query: { redirect: '/cart' } })
        ElMessage.warning('请先登录后查看购物车')
      } else {
        // 已登录时直接导航到购物车页面
        router.push('/cart')
      }
    }
    
    // 本地登录
    const handleLogin = () => {
      const { username, password } = loginForm.value
      if (!username || !password) {
        ElMessage.warning('请输入用户名和密码')
        return
      }
      
      isLoading.value = true
      
      /**
       * 管理员账号特殊处理
       * 当用户输入管理员凭据(admin/admin123)时：
       * 1. 确保管理员账号在用户列表中存在
       * 2. 使用管理员权限登录系统
       * 3. 自动跳转到管理后台
       */
      if (username === 'admin' && password === 'admin123') {
        // 创建管理员账号
        const adminUser = {
          id: 'admin',
          username: 'admin',
          password: 'admin123',
          name: '系统管理员',
          role: 'admin',
          email: 'admin@example.com',
          registerTime: new Date().toISOString()
        }
        
        // 特殊处理：确保users列表中有管理员账号
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          // 检查是否已存在管理员账号
          const adminExists = users.some(user => user.username === 'admin')
          
          if (!adminExists) {
            // 添加到用户列表
            users.push(adminUser)
            localStorage.setItem('users', JSON.stringify(users))
            console.log('管理员账号创建成功')
          }
          
          // 用户登录
          userStore.login(adminUser)
          
          // 导入并初始化订单数据
          const ordersStore = useOrdersStore()
          ordersStore.initOrdersData()
          ordersStore.fetchOrders()
          
          ElMessage.success('管理员登录成功')
          loginVisible.value = false
          
          // 检查是否有重定向路径
          const redirectPath = router.currentRoute.value.query.redirect
          if (redirectPath) {
            router.push(redirectPath)
          } else {
            // 管理员直接跳转到管理后台
            router.push('/admin')
          }
          
          isLoading.value = false
          return
        } catch (error) {
          console.error('管理员登录失败:', error)
        }
      }
      
      // 普通用户登录逻辑
      // 模拟网络请求延时
      setTimeout(() => {
        try {
          // 从本地存储获取用户列表
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          
          // 查找匹配的用户凭据
          const user = users.find(u => u.username === username && u.password === password)
          
          if (user) {
            // 检查用户是否被禁用
            if (user.active === false) {
              ElMessage.error('您的账号已被禁用，请联系管理员')
              isLoading.value = false
              return
            }
            
            // 用户凭据匹配
            if (rememberMe.value) {
              // 如果选择了记住我，可以在这里设置更长的过期时间
              localStorage.setItem('rememberUser', 'true')
            }
            
            // 确保用户有唯一ID
            if (!user.id) {
              user.id = user.username || `U${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`
            }
            
            // 执行用户登录
            userStore.login(user)
            
            // 初始化用户的订单数据
            const ordersStore = useOrdersStore()
            ordersStore.initOrdersData()
            ordersStore.fetchOrders()
            
            // 显示登录成功消息
            ElMessage.success('登录成功')
            // 关闭登录对话框
            loginVisible.value = false
            
            // 处理重定向逻辑
            const redirectPath = router.currentRoute.value.query.redirect
            if (redirectPath) {
              router.push(redirectPath)
            }
          } else {
            // 用户凭据不匹配
            ElMessage.error('用户名或密码错误')
          }
        } finally {
          // 无论成功或失败，都重置加载状态
          isLoading.value = false
        }
      }, 800)
    }

    // 本地注册
    const handleRegister = () => {
      if (!agreeTerms.value) {
        ElMessage.warning('请先阅读并同意用户协议与隐私政策')
        return
      }
      
      const { username, password, confirmPassword, role } = registerForm.value
      if (!username || !password || !confirmPassword) {
        ElMessage.warning('请填写完整信息')
        return
      }
      if (password !== confirmPassword) {
        ElMessage.warning('两次输入的密码不一致')
        return
      }
      
      // 禁止注册admin用户名
      if (username.toLowerCase() === 'admin') {
        ElMessage.error('该用户名已被系统保留，请使用其他用户名')
        return
      }
      
      isLoading.value = true
      
      // 模拟网络请求延时
      setTimeout(() => {
        try {
          // 读取本地用户
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          if (users.find(u => u.username === username)) {
            ElMessage.error('用户名已存在')
            return
          }
          
          // 生成唯一ID，确保不会与已删除用户的ID或用户名冲突
          const timestamp = Date.now();
          const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          const uniqueId = `U${timestamp}_${randomPart}`;
          
          // 创建新用户，包含角色信息和唯一ID
          users.push({ 
            id: uniqueId,
            username, 
            password, 
            name: username,
            role: role, // 添加用户角色
            active: true, // 默认启用
            registerTime: new Date().toISOString()
          })
          localStorage.setItem('users', JSON.stringify(users))
          ElMessage.success('注册成功，请登录')
          registerVisible.value = false
          loginVisible.value = true
          if (loginForm.value) {
            loginForm.value.username = username
          }
        } finally {
          isLoading.value = false
        }
      }, 800)
    }

    // 退出登录
    const handleCommand = (command) => {
      if (command === 'logout') {
        // 清理订单数据
        const ordersStore = useOrdersStore()
        ordersStore.clearOrdersData()
        
        // 登出用户
        userStore.logout()
        
        ElMessage.success('已退出登录')
        router.push('/')
      } else if (command === 'profile' || command === 'dashboard') {
        // 根据用户角色跳转到相应的用户中心
        if (isSeller.value) {
          router.push('/seller')
        } else if (isAdmin.value) {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else if (command === 'orders') {
        router.push('/orders')
      } else if (command === 'seller') {
        router.push('/seller')
      } else if (command === 'admin') {
        router.push('/admin')
      }
    }
    
    // 返回首页
    const goToHome = () => {
      router.push('/')
      loginVisible.value = false
      registerVisible.value = false
    }
    
    // 路由导航方法
    const navigateTo = (path) => {
      router.push(path)
    }
    
    // 因为使用自定义单选按钮，不再需要特定的处理函数
    
    
    
    
    
    return {
      shop: "fzq的小商城",
      

      keyword,
      isLoggedIn,
      user,
      isBuyer,
      isSeller,
      isAdmin,
      cartCount,
      loginVisible,
      loginForm,
      loginRules,
      registerVisible,
      registerForm,
      registerRules,
      rememberMe,
      agreeTerms,
      isLoading,
      handleSearch,
      handleLogin,
      handleRegister,
      handleCommand,
      switchToRegister,
      switchToLogin,
      goToHome,
      onLoginInput,
      onLoginPasswordInput,
      onRegisterInput,
      onRegisterPasswordInput,
      onRegisterConfirmInput,
      handleOrdersClick,
      handleCartClick,
      navigateTo
    }
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.menu {
  height: 68px;
  border-bottom: none;
  display: flex;
  justify-content: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 100%;
}

.logo {
  margin-right: 30px;
}

.logo a {
  text-decoration: none;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-main {
  color: var(--primary-color);
  font-size: 22px;
  font-weight: bold;
}

.logo-sub {
  color: var(--gray-600);
  font-size: 12px;
  letter-spacing: 1px;
}

.search-container {
  flex: 1;
  margin: 0 30px;
}

.search-input {
  width: 100%;
  max-width: 500px;
}

.search-input :deep(.el-input__inner) {
  border-radius: 20px;
  background-color: var(--gray-100);
  border: none;
  padding-left: 15px;
  height: 40px;
  transition: all var(--transition-fast);
}

.search-input :deep(.el-input__inner):focus {
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.search-input :deep(.el-input__prefix) {
  left: 10px;
}

.menu-items {
  display: flex;
}

.menu-items .el-menu-item {
  height: 68px;
  line-height: 68px;
  font-size: 15px;
}

.menu-items .el-menu-item i {
  margin-right: 5px;
  font-size: 18px;
}

.menu-items .el-menu-item.is-active {
  font-weight: 600;
}

.cart-badge :deep(.el-badge__content) {
  background-color: var(--secondary-color);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.user-actions {
  margin-left: 30px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 25px;
  background-color: var(--gray-100);
  transition: all var(--transition-fast);
}

.user-profile:hover {
  background-color: var(--gray-200);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 8px;
}

.user-name {
  font-weight: 500;
  margin-right: 5px;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-buttons {
  display: flex;
  align-items: center;
}

.login-btn, .register-btn {
  font-weight: 500;
  font-size: 15px;
  padding: 8px 12px;
}

.login-btn {
  color: var(--primary-color);
}

.register-btn {
  color: var(--secondary-color);
}

.divider {
  color: var(--gray-400);
  margin: 0 5px;
}

/* 登录和注册对话框样式 */
.auth-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.auth-dialog :deep(.el-dialog__header) {
  display: none;
}

.auth-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
}

.auth-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 5px 15px rgba(74, 108, 247, 0.2);
}

.auth-icon i {
  font-size: 28px;
  color: white;
}

.auth-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--gray-800);
}

.auth-subtitle {
  color: var(--gray-600);
  font-size: 15px;
}

.auth-form {
  margin-top: 25px;
}

.auth-form .custom-input {
  border-radius: 8px;
  height: 45px;
  transition: all 0.3s;
  border: 1px solid var(--gray-200);
}

.auth-form .custom-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
}

.auth-form .custom-input i {
  color: var(--primary-color);
  font-size: 18px;
}

.auth-form .native-input {
  font-size: 30px;
}

.auth-submit-btn {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 15px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  border: none;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(74, 108, 247, 0.2);
}

.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(74, 108, 247, 0.25);
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-switch-link {
  font-size: 15px;
  color: var(--gray-600);
  margin-bottom: 15px;
}

.auth-switch-link .el-button {
  font-size: 15px;
  color: var(--primary-color);
  font-weight: 500;
}

.back-home-btn {
  font-size: 14px;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  margin-top: 10px;
}

.back-home-btn:hover {
  color: var(--primary-color);
}

.admin-hint {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  text-align: center;
  padding: 5px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

@media (max-width: 992px) {
  .menu {
    padding: 0 10px;
  }
  
  .search-container {
    margin: 0 15px;
  }
  
  .logo-main {
    font-size: 18px;
  }
  
  .logo-sub {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0;
  }
  
  .logo {
    margin-right: 0;
  }
  
  .search-container {
    order: 3;
    width: 100%;
    margin: 10px 0;
  }
  
  .menu-items {
    order: 2;
    flex: 1;
    justify-content: center;
  }
  
  .menu-items .el-menu-item {
    padding: 0 10px;
  }
  
  .user-actions {
    margin-left: 0;
  }
  
  .user-name {
    display: none;
  }
}

.login-form :deep(.el-input__inner),
.register-form :deep(.el-input__inner) {
  /* 修复输入框更新延迟问题 */
  --webkit-appearance: none !important;
  --moz-appearance: none !important;
  appearance: none !important;
  background-color: white !important;
  transition: none !important;
  color: var(--gray-900) !important;
  caret-color: var(--primary-color) !important;
}

/* 提高输入框的优先级和性能 */
.login-form :deep(.el-input),
.register-form :deep(.el-input) {
  position: relative;
  z-index: 2;
  isolation: isolate;
  will-change: contents;
}

/* 确保输入框获得焦点时立即响应 */
.login-form :deep(.el-input__inner:focus),
.register-form :deep(.el-input__inner:focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2) !important;
}

/* 原生输入框样式 */
.custom-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: 0 12px;
  height: 40px;
  transition: all 0.2s;
}

.custom-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.custom-input i {
  color: var(--gray-500);
  font-size: 16px;
  margin-right: 8px;
}

.native-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  height: 100%;
  font-size: 14px;
  color: var(--gray-900);
}

.native-input::placeholder {
  color: var(--gray-400);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-agreement {
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--gray-600);
}

.forgot-password,
.terms-link {
  font-size: 14px;
  padding: 0;
}



















/* 自定义单选按钮样式 */
.role-select {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}

.role-select .el-radio {
  margin-right: 0;
  cursor: pointer;
  border-radius: 4px;
  padding: 6px 12px;
  transition: all 0.2s ease;
}

.role-select .el-radio:hover {
  background-color: var(--gray-100);
}

.role-select .el-radio.is-checked {
  background-color: rgba(64, 158, 255, 0.1);
}

.role-select .el-radio__input.is-checked + .el-radio__label {
  color: var(--primary-color);
  font-weight: 500;
}

.role-select .el-radio__input.is-checked .el-radio__inner {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* ElementPlus RadioButton 增强样式 */


















/* 隐藏默认的单选按钮圆点 */




/* 原生Radio按钮样式 */
.native-radio-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.native-radio {
  flex: 1;
  height: 80px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 0;
}

.native-radio:hover {
  border-color: var(--gray-400);
  background-color: var(--gray-100);
}

.native-radio.active {
  border-color: var(--primary-color);
  background-color: rgba(74, 108, 247, 0.08);
  box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
  transform: translateY(-2px);
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}

.radio-content i {
  font-size: 26px;
  margin-bottom: 8px;
  color: var(--gray-500);
  transition: all 0.15s ease;
}

.native-radio.active .radio-content i {
  color: var(--primary-color);
  transform: scale(1.15);
}

.radio-content span {
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-600);
  transition: all 0.15s ease;
}

.native-radio.active .radio-content span {
  color: var(--primary-color);
  font-weight: 600;
}
</style> 