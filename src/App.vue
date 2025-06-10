<template>
  <!-- 根组件容器，包含整个应用 -->
  <div id="app">
    <!-- 路由视图容器，根据路由显示不同页面 -->
    <router-view></router-view>
  </div>
</template>

<script>
// 导入存储模块
import { useUserStore } from '@/stores/userStore'     // 用户状态管理
import { useCartStore } from '@/stores/cartStore'     // 购物车状态管理
import { useOrdersStore } from '@/stores/ordersStore' // 订单状态管理
import { useProductsStore } from '@/stores/productsStore' // 商品状态管理
import { onMounted, watch } from 'vue'  // Vue生命周期钩子
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

/**
 * 应用根组件
 * 负责应用初始化、预加载数据和全局状态设置
 */
export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  setup() {
    // 初始化各状态管理存储
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const ordersStore = useOrdersStore()
    const productsStore = useProductsStore()
    const router = useRouter()
    
    onMounted(() => {
      // 预加载商品数据，加速首次访问体验
      productsStore.fetchProducts().then(() => {
        console.log('商品数据预加载成功')
      }).catch(error => {
        console.error('商品数据预加载失败:', error)
      })
      
      // 初始化订单数据，确保数据结构正确
      ordersStore.initOrdersData()
      console.log('订单数据初始化完成')
      
      // 创建默认管理员账号，确保系统能够正常管理
      initAdminAccount()
      
      // 解决Element Plus中的ResizeObserver循环通知错误
      // 通过重写ResizeObserver类并添加防抖机制来避免频繁更新
      window.ResizeObserver = class ResizeObserver extends window.ResizeObserver {
        constructor(callback) {
          // 防抖处理，避免短时间内频繁触发回调
          let timer = null;
          const debouncedCallback = function () {
            let context = this;
            let args = arguments;
            clearTimeout(timer);
            // 设置16ms延迟，对应60fps的刷新率
            timer = setTimeout(function () {
              callback.apply(context, args);
            }, 16);
          };
          // 调用原始ResizeObserver构造函数，传入防抖包装后的回调
          super(debouncedCallback);
        }
      };
      
      // 在应用启动时检查用户状态
      if (userStore.isLoggedIn) {
        const isValid = userStore.checkUserStatus()
        if (!isValid) {
          ElMessage.error('您的账号已被禁用，请联系管理员')
          router.push('/')
        }
      }
    })
    
    // 监听路由变化，在每次路由切换时检查用户状态
    watch(() => router.currentRoute.value, () => {
      if (userStore.isLoggedIn) {
        userStore.checkUserStatus()
      }
    })
    
    /**
     * 初始化管理员账号
     * 确保系统中至少存在一个管理员账号，用于系统管理
     */
    const initAdminAccount = () => {
      try {
        // 从本地存储中读取用户列表
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // 检查是否已存在管理员角色的账号
        const adminExists = users.some(user => user.role === 'admin')
        
        if (!adminExists) {
          // 如果不存在管理员账号，创建默认管理员
          const adminUser = {
            id: 'admin',
            username: 'admin',
            password: 'admin123',  // 在实际项目中应加密存储
            name: '系统管理员',
            role: 'admin',
            email: 'admin@example.com',
            registerTime: new Date().toISOString()
          }
          
          // 将管理员账号添加到用户列表
          users.push(adminUser)
          // 保存更新后的用户列表到本地存储
          localStorage.setItem('users', JSON.stringify(users))
          console.log('默认管理员账号创建成功')
        } else {
          console.log('管理员账号已存在，无需创建')
        }
      } catch (error) {
        console.error('创建管理员账号失败:', error)
      }
    }
    
    return {}
  }
}
</script>

<style>
/**
 * CSS变量定义
 * 用于全局样式统一，便于主题定制
 */
:root {
  /* 主题色 */
  --primary-color: #545eeb;
  --primary-light: #4d1275;
  --primary-dark: #551189;
  --secondary-color: #ff6b6b;
  
  /* 功能色 */
  --success-color: #28a745;
  --warning-color: #ffbb33;
  --danger-color: #dc3545;
  
  /* 灰度色阶 */
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --gray-700: #495057;
  --gray-800: #343a40;
  --gray-900: #212529;
  
  /* 阴影效果 */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  
  /* 圆角和过渡 */
  --border-radius: 10px;
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
  --transition-slow: 0.5s;
  
  /* 字体 */
  --font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

/* 重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 基础页面样式 */
html, body {
  height: 100%;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  color: var(--gray-800);
  line-height: 1.6;
}

/* 应用容器样式 */
#app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 全局链接样式 */
a {
  text-decoration: none;
  color: var(--primary-color);
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-light);
}

/* 标题样式 */
h1, h2, h3, h4, h5, h6 {
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

/* Element Plus 样式自定义覆盖 */
/* 卡片组件 */
.el-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: none;
  box-shadow: var(--shadow-sm);
}

.el-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 按钮组件 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--transition-fast);
  padding: 10px 20px;
}

/* 主要按钮 */
.el-button--primary {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  border-color: var(--primary-color);
}

.el-button--primary:hover {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(74, 108, 247, 0.25);
}

/* 危险按钮 */
.el-button--danger {
  background: linear-gradient(135deg, #ff8a8a, var(--danger-color));
  border-color: var(--danger-color);
}

.el-button--danger:hover {
  background: linear-gradient(135deg, var(--danger-color), #c82333);
  border-color: #bd2130;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.25);
}

.el-button--success {
  background: linear-gradient(135deg, #40c98c, var(--success-color));
  border-color: var(--success-color);
}

.el-button--success:hover {
  background: linear-gradient(135deg, var(--success-color), #218838);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.25);
}

.el-table {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.el-table th {
  background-color: #f8faff !important;
  font-weight: 600;
}

.el-table--border, .el-table--group {
  border-radius: var(--border-radius);
}

.el-input {
  border-radius: var(--border-radius);
}

.el-input__inner {
  padding: 10px 15px;
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-300);
  transition: all var(--transition-fast);
}

.el-input__inner:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
}

.el-dialog {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.el-dialog__header {
  background: var(--primary-color);
  color: white;
  padding: 15px 20px;
}

.el-dialog__title {
  color: white;
  font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.8);
}

.el-dialog__headerbtn:hover .el-dialog__close {
  color: white;
}

.el-tabs__nav-wrap::after {
  height: 1px;
  background-color: var(--gray-200);
}

.el-tabs__item.is-active {
  color: var(--primary-color);
}

.el-tabs__active-bar {
  background-color: var(--primary-color);
  height: 3px;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.el-radio__input.is-checked+.el-radio__label {
  color: var(--primary-color);
}

.el-radio-button__orig-radio:checked+.el-radio-button__inner {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: -1px 0 0 0 var(--primary-dark);
}

/* 响应式布局基础类 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 通用卡片容器 */
.card-container {
  padding: 25px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 25px;
  transition: all var(--transition-normal);
}

.card-container:hover {
  box-shadow: var(--shadow-md);
}

/* 页面标题通用样式 */
.page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 25px;
  color: var(--gray-800);
  position: relative;
  padding-bottom: 12px;
}

.page-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 70px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: 4px;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

::-webkit-scrollbar-track {
  background: var(--gray-200);
}

/* 加载动画 */
.loading-pulse {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.loading-pulse div {
  position: absolute;
  border: 4px solid var(--primary-color);
  opacity: 1;
  border-radius: 50%;
  animation: loading-pulse 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.loading-pulse div:nth-child(2) {
  animation-delay: -0.5s;
}

@keyframes loading-pulse {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

/* 页脚通用样式 */
.footer {
  background: linear-gradient(to right, #2c3e50, #4a5568);
  color: white;
  text-align: center;
  padding: 40px 20px;
  margin-top: 60px;
}

.footer p {
  margin: 5px 0;
  opacity: 0.9;
}

/* 美化按钮 */
.btn-animated {
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.btn-animated:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
  transition: all 0.3s ease;
  z-index: -1;
}

.btn-animated:hover:after {
  left: 100%;
}

/* 美化图片悬停效果 */
.img-hover-zoom {
  overflow: hidden;
  border-radius: var(--border-radius);
}

.img-hover-zoom img {
  transition: transform var(--transition-normal);
}

.img-hover-zoom:hover img {
  transform: scale(1.08);
}

/* 添加阴影悬停效果 */
.shadow-hover {
  transition: all var(--transition-normal);
}

.shadow-hover:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

/* 添加闪光效果 */
.shine-effect {
  position: relative;
  overflow: hidden;
}

.shine-effect:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 100%
  );
  transform: skewX(-25deg);
  z-index: 1;
}

.shine-effect:hover:before {
  animation: shine 0.75s;
}

@keyframes shine {
  100% {
    left: 125%;
  }
}

/* 添加波纹效果按钮 */
.ripple-btn {
  position: relative;
  overflow: hidden;
}

.ripple-btn:after {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform .5s, opacity 1s;
}

.ripple-btn:active:after {
  transform: scale(0, 0);
  opacity: .3;
  transition: 0s;
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .card-container {
    padding: 16px;
  }
  
  .el-button {
    padding: 8px 16px;
  }
}
</style>
