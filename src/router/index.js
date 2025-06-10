/**
 * 路由配置文件
 * 定义应用的路由规则和权限控制
 */
import { createRouter, createWebHistory } from 'vue-router'
import { USER_ROLES } from '../stores/userStore'

/**
 * 路由配置数组
 * 每个路由对象定义了URL路径、名称、组件和元数据
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home.vue')
    // 无需权限，所有用户可访问
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/products.vue')
    // 无需权限，所有用户可访问
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
    // 无需权限，所有用户可访问，:id为动态路由参数
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/cart.vue')
    // 无需权限，所有用户可访问，但实际功能可能需要登录
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue')
    // 无需权限，但实际功能需要用户登录才能使用
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { requiresAuth: true } // 需要登录才能访问
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user.vue'),
    meta: { requiresAuth: true } // 需要登录才能访问
  },
  /**
   * 买家用户中心
   * 只有买家角色的用户可以访问
   */
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { 
      requiresAuth: true, // 需要登录
      role: 'buyer'       // 需要买家角色
    }
  },
  /**
   * 卖家管理中心
   * 只有卖家角色的用户可以访问
   */
  {
    path: '/seller',
    name: 'SellerDashboard',
    component: () => import('../views/SellerDashboard.vue'),
    meta: { 
      requiresAuth: true, // 需要登录
      role: 'seller'      // 需要卖家角色
    }
  },
  /**
   * 管理员后台
   * 只有admin角色的用户可以访问
   * 提供系统管理功能
   */
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { 
      requiresAuth: true, // 需要登录
      role: 'admin'       // 需要管理员角色
    }
  }
]

/**
 * 创建路由实例
 * 使用HTML5历史模式，可以使用正常的URL而不是hash模式的URL
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导入用户状态管理
import { useUserStore } from '../stores/userStore'

/**
 * 全局路由守卫
 * 在每次路由跳转前执行，用于权限控制
 * 
 * @param {Object} to - 目标路由对象
 * @param {Object} from - 来源路由对象
 * @param {Function} next - 控制路由跳转的函数
 */
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录权限（meta.requiresAuth为true）
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // 在路由守卫中使用Pinia需要创建store实例
  const userStore = useUserStore()
  
  // 获取用户登录状态
  const isLoggedIn = userStore.isLoggedIn
  
  // 获取当前用户角色（买家、卖家或管理员）
  const userRole = userStore.userRole
  
  // 检查用户是否被禁用
  if (isLoggedIn) {
    const isValid = userStore.checkUserStatus()
    if (!isValid) {
      // 用户被禁用，重定向到首页
      next({ path: '/' })
      return
    }
  }
  
  if (requiresAuth && !isLoggedIn) {
    // 情况1：路由需要登录但用户未登录
    // 重定向到首页，并携带重定向参数，便于登录后回到原目标页面
    next({ 
      path: '/', 
      query: { redirect: to.fullPath } 
    })
  } else if (to.meta.role && to.meta.role !== userRole) {
    // 情况2：路由需要特定角色权限，但用户不具备该角色
    // 例如：普通用户试图访问管理员页面
    next({ path: '/' }) // 重定向到首页
  } else {
    // 情况3：满足权限要求或无需特殊权限
    // 允许继续导航
    next()
  }
})

export default router 