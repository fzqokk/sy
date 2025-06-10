<template>
  <div class="user-dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <h1>用户中心</h1>
        <p>欢迎回来，{{ userInfo.name }}</p>
      </div>
      <div class="header-right">
        <el-button type="primary" plain size="small" @click="goToHome">
          <i class="el-icon-back"></i> 返回首页
        </el-button>
      </div>
    </div>
    
    <div class="container">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="user-info-card">
            <div class="user-avatar">
              <div class="avatar-circle">{{ userInfo.name ? userInfo.name.substring(0, 1).toUpperCase() : 'U' }}</div>
            </div>
            <div class="user-name">{{ userInfo.name }}</div>
            <div class="user-role">{{ getUserRoleText(userInfo.role) }}</div>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ orderCount }}</div>
                <div class="stat-label">订单</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ favoriteCount }}</div>
                <div class="stat-label">收藏</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ couponCount }}</div>
                <div class="stat-label">优惠券</div>
              </div>
            </div>
            <el-button type="primary" @click="$router.push('/profile')">
              编辑个人资料
            </el-button>
          </div>
          
          <el-card shadow="hover" class="dashboard-card">
            <template #header>
              <div class="card-header">
                <h3>我的优惠券</h3>
                <el-button type="primary" text>查看全部</el-button>
              </div>
            </template>
            <div class="coupon-list" v-if="coupons.length > 0">
              <div class="coupon-item" v-for="(coupon, index) in coupons" :key="index">
                <div class="coupon-amount">{{ coupon.amount }}</div>
                <div class="coupon-info">
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-desc">{{ coupon.desc }}</div>
                  <div class="coupon-time">有效期至：{{ coupon.expireDate }}</div>
                </div>
              </div>
            </div>
            <div class="empty-data" v-else>
              <i class="el-icon-tickets"></i>
              <p>暂无优惠券</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="18">
          <el-card shadow="hover" class="dashboard-card">
            <template #header>
              <div class="card-header">
                <h3>最近订单</h3>
                <el-button type="primary" text @click="$router.push('/orders')">查看全部</el-button>
              </div>
            </template>
            <el-table :data="recentOrders" style="width: 100%" v-if="recentOrders.length > 0">
              <el-table-column prop="id" label="订单编号" width="180"></el-table-column>
              <el-table-column prop="date" label="下单时间" width="180"></el-table-column>
              <el-table-column prop="items" label="商品"></el-table-column>
              <el-table-column prop="total" label="金额">
                <template #default="scope">
                  ¥{{ scope.row.total.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="getOrderStatusType(scope.row.status)">
                    {{ getOrderStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="small" type="primary" plain @click="handleViewOrder(scope.row)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="empty-data" v-else>
              <i class="el-icon-document"></i>
              <p>暂无订单</p>
            </div>
          </el-card>
          
          <el-card shadow="hover" class="dashboard-card">
            <template #header>
              <div class="card-header">
                <h3>商品推荐</h3>
              </div>
            </template>
            <div class="product-grid" v-if="recommendProducts.length > 0">
              <div 
                class="product-card" 
                v-for="(product, index) in recommendProducts" 
                :key="index"
                @click="$router.push(`/product/${product.id}`)"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="empty-data" v-else>
              <i class="el-icon-goods"></i>
              <p>暂无推荐商品</p>
            </div>
          </el-card>
          
          <el-card shadow="hover" class="dashboard-card">
            <template #header>
              <div class="card-header">
                <h3>收藏的商品</h3>
                <el-button type="primary" text>查看全部</el-button>
              </div>
            </template>
            <div class="product-grid" v-if="favoriteProducts.length > 0">
              <div 
                class="product-card" 
                v-for="(product, index) in favoriteProducts" 
                :key="index"
                @click="$router.push(`/product/${product.id}`)"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="empty-data" v-else>
              <i class="el-icon-star-off"></i>
              <p>暂无收藏商品</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserDashboard',
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const router = useRouter()
    
    // 用户信息
    const userInfo = computed(() => userStore.currentUser || {})
    
    // 统计数据
    const orderCount = computed(() => ordersStore.orders?.length || 0)
    const favoriteCount = ref(8)
    const couponCount = ref(2)
    
    // 最近订单
    const recentOrders = computed(() => {
      // 从store中获取所有订单
      const allOrders = ordersStore.userOrders || []
      // 按日期排序并只返回最近3个订单
      return [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(order => ({
          id: order.id,
          date: formatDate(order.createdAt),
          items: order.items.length > 1 
            ? `${order.items[0].name} 等${order.items.length}件商品` 
            : order.items[0]?.name || '未知商品',
          total: order.total,
          status: order.status
        }))
    })
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    }
    
    // 优惠券
    const coupons = ref([
      {
        amount: '¥50',
        title: '满300减50',
        desc: '全场通用',
        expireDate: '2023-06-30'
      },
      {
        amount: '¥20',
        title: '满100减20',
        desc: '服装类商品专用',
        expireDate: '2023-07-15'
      }
    ])
    
    // 推荐商品
    const recommendProducts = ref([
      {
        id: 1,
        name: '时尚T恤',
        price: 99.00,
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 2,
        name: '休闲牛仔裤',
        price: 199.00,
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 3,
        name: '运动鞋',
        price: 299.00,
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 4,
        name: '时尚背包',
        price: 159.00,
        image: 'https://via.placeholder.com/150'
      }
    ])
    
    // 收藏商品
    const favoriteProducts = ref([
      {
        id: 5,
        name: '智能手表',
        price: 699.00,
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 6,
        name: '无线耳机',
        price: 399.00,
        image: 'https://via.placeholder.com/150'
      }
    ])
    
    // 初始化
    onMounted(async () => {
      // 检查用户是否是买家
      if (!userInfo.value || userInfo.value.role !== 'buyer') {
        ElMessage.warning('您没有访问此页面的权限')
        router.push('/')
        return
      }
      
      // 加载订单数据
      try {
        // 确保订单数据已初始化
        ordersStore.initOrdersData()
        await ordersStore.fetchOrders()
        console.log('用户中心订单数据加载成功')
      } catch (error) {
        console.error('获取订单数据失败:', error)
      }
      
      // 加载其他数据（这里使用模拟数据）
      loadUserData()
    })
    
    // 加载用户数据
    const loadUserData = () => {
      // 实际应用中这里会从API获取数据
      console.log('加载用户数据')
    }
    
    // 获取订单状态类型（用于标签颜色）
    const getOrderStatusType = (status) => {
      const statusMap = {
        '待付款': 'warning',
        '已付款': 'info',
        '已发货': 'primary',
        '已送达': 'success',
        '已完成': 'success',
        '已取消': 'danger',
        'pending': 'warning',
        'paid': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'completed': 'success',
        'cancelled': 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取订单状态文本
    const getOrderStatusText = (status) => {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'completed': '已完成',
        'cancelled': '已取消',
        '待付款': '待付款',
        '已付款': '已付款',
        '已发货': '已发货',
        '已送达': '已送达',
        '已完成': '已完成',
        '已取消': '已取消'
      }
      return statusMap[status] || status
    }
    
    // 获取用户角色文本
    const getUserRoleText = (role) => {
      const roleMap = {
        'admin': '管理员',
        'seller': '卖家',
        'buyer': '买家'
      }
      return roleMap[role] || '未知角色'
    }
    
    // 查看订单
    const handleViewOrder = (order) => {
      router.push(`/orders?id=${order.id}`)
    }
    
    // 返回首页
    const goToHome = () => {
      router.push('/')
    }

    return {
      goToHome,
      userInfo,
      orderCount,
      favoriteCount,
      couponCount,
      recentOrders,
      coupons,
      recommendProducts,
      favoriteProducts,
      getOrderStatusType,
      getOrderStatusText,
      getUserRoleText,
      handleViewOrder,
      formatDate
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  background-color: var(--gray-100);
  min-height: calc(100vh - 68px);
  padding-bottom: 60px;
}

.dashboard-header {
  background: linear-gradient(135deg, #4d8cf5, #2c5eaa);
  color: white;
  padding: 50px 0 70px;
  margin-bottom: -40px;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.6;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-header p {
  max-width: 1200px;
  margin: 15px auto 0;
  padding: 0 20px;
  opacity: 0.9;
  font-size: 18px;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-info-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 35px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.user-info-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.user-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  box-shadow: 0 10px 20px rgba(74, 108, 247, 0.25);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 25px rgba(74, 108, 247, 0.35);
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 5px;
}

.user-role {
  font-size: 15px;
  color: var(--gray-600);
  margin-bottom: 25px;
  padding: 5px 15px;
  background-color: rgba(74, 108, 247, 0.1);
  border-radius: 20px;
}

.user-stats {
  display: flex;
  width: 100%;
  margin-bottom: 30px;
  background-color: var(--gray-100);
  border-radius: 12px;
  padding: 15px 10px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 10px;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background-color: var(--gray-300);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.dashboard-card {
  margin-bottom: 30px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  display: flex;
  align-items: center;
}

.card-header h3:before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-light));
  margin-right: 10px;
  border-radius: 2px;
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: var(--gray-500);
}

.empty-data i {
  font-size: 48px;
  margin-bottom: 15px;
  color: var(--gray-400);
  opacity: 0.8;
}

.empty-data p {
  margin: 0;
  font-size: 16px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
}

.coupon-item {
  display: flex;
  background: linear-gradient(to right, #f6f7f9, #fff);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.coupon-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.08);
}

.coupon-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 5px;
}

.coupon-desc {
  font-size: 13px;
  color: var(--gray-600);
  margin-bottom: 5px;
}

.coupon-time {
  font-size: 12px;
  color: var(--gray-500);
  display: flex;
  align-items: center;
}

.coupon-time:before {
  content: '⏱️';
  margin-right: 5px;
  font-size: 14px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.product-image {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.product-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0));
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-image::after {
  opacity: 1;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
  display: flex;
  align-items: center;
}

.product-price::before {
  content: '¥';
  font-size: 14px;
  margin-right: 2px;
  font-weight: normal;
}

/* 返回首页按钮样式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-right .el-button {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: white;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.header-right .el-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  margin: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: #f8faff !important;
  font-weight: 600;
  color: var(--gray-700);
  padding: 15px 0;
}

.el-table td {
  padding: 12px 0;
}

.el-tag {
  border-radius: 4px;
  padding: 2px 8px;
  font-weight: 500;
}

.el-button--text {
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.3s;
}

.el-button--text:hover {
  color: var(--primary-dark);
  transform: translateX(3px);
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .dashboard-header {
    padding: 40px 0 60px;
  }
  
  .dashboard-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .avatar-circle {
    width: 80px;
    height: 80px;
    font-size: 30px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 15px;
  }
  
  .dashboard-header h1 {
    font-size: 24px;
  }
  
  .dashboard-header p {
    font-size: 16px;
  }
}
</style> 