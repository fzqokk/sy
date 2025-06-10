<template>
  <div class="orders-page">
    <Header />
    
    <div class="main-content">
      <h1 class="page-title">我的订单</h1>
      
      <!-- 未登录状态显示 -->
      <div v-if="!isLoggedIn" class="login-required">
        <el-empty description="请先登录后查看订单" :image-size="200">
          <template #extra>
            <el-button type="primary" @click="showLoginDialog">立即登录</el-button>
            <el-button @click="$router.push('/products')">去购物</el-button>
          </template>
        </el-empty>
      </div>
      
      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="orders.length > 0" class="orders-list">
        <el-tabs type="border-card" v-model="activeTab">
          <el-tab-pane label="全部订单" name="all"></el-tab-pane>
          <el-tab-pane label="待付款" name="pending"></el-tab-pane>
          <el-tab-pane label="已付款" name="paid"></el-tab-pane>
        </el-tabs>
        
        <div class="orders-content">
          <el-card v-for="order in filteredOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号：{{ order.id }}</span>
                <span class="order-date">下单时间：{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="order-status" :class="'status-' + getOrderStatusType(order.status)">
                {{ getOrderStatusText(order.status) }}
              </div>
            </div>
            
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <div class="item-image">
                  <img :src="item.images[0]" @click="goToProduct(item.id)" />
                </div>
                <div class="item-info">
                  <div class="item-name" @click="goToProduct(item.id)">{{ item.name }}</div>
                  <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
                </div>
                <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
              </div>
            </div>
            
            <div class="order-footer">
              <div class="order-address">
                <span class="address-label">收货地址：</span>
                <span class="address-value">{{ formatAddress(order.address) }}</span>
              </div>
              <div class="order-total">
                <span>共 {{ getTotalItems(order) }} 件商品，总计：</span>
                <span class="total-price">¥{{ order.total.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button size="small" @click="viewOrderDetail(order)">查看详情</el-button>
                <el-button v-if="order.status === '待付款'" type="primary" size="small" @click="payOrder(order)">
                  去支付
                </el-button>
                <el-button v-if="order.status === '已付款'" type="success" size="small" plain disabled>
                  已付款
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <div v-else class="orders-empty">
        <el-empty description="您还没有订单，去选购商品吧~" :image-size="200">
          <template #extra>
            <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
          </template>
        </el-empty>
      </div>
    </div>
    
    <!-- 订单详情对话框 -->
    <el-dialog 
      title="订单详情" 
      v-model="detailVisible" 
      width="70%"
      :close-on-click-modal="false"
      :append-to-body="true"
      :resize-observer="false"
      destroy-on-close>
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h3>订单信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">{{ currentOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <span :class="'status-' + getOrderStatusType(currentOrder.status)">
                {{ getOrderStatusText(currentOrder.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间" v-if="currentOrder.paidAt">{{ formatDate(currentOrder.paidAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-section">
          <h3>收货信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">{{ currentOrder.address.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.address.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">{{ formatAddress(currentOrder.address) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table 
            :data="currentOrder.items" 
            style="width: 100%" 
            border
            :height="400"
            :resize-observer="false">
            <el-table-column label="商品信息" min-width="400">
              <template #default="scope">
                <div class="product-info">
                  <div class="product-image">
                    <img :src="scope.row.images[0]" />
                  </div>
                  <div class="product-name">
                    {{ scope.row.name }}
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="单价" width="100" align="center">
              <template #default="scope">
                <div class="product-price">¥{{ scope.row.price }}</div>
              </template>
            </el-table-column>
            
            <el-table-column label="数量" width="100" align="center">
              <template #default="scope">
                <div class="product-quantity">{{ scope.row.quantity }}</div>
              </template>
            </el-table-column>
            
            <el-table-column label="小计" width="120" align="center">
              <template #default="scope">
                <div class="product-subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="order-payment">
            <div class="payment-item">
              <span>商品总额：</span>
              <span>¥{{ currentOrder.total.toFixed(2) }}</span>
            </div>
            <div class="payment-item">
              <span>运费：</span>
              <span>¥0.00</span>
            </div>
            <div class="payment-total">
              <span>实付金额：</span>
              <span>¥{{ currentOrder.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button 
            v-if="currentOrder && (currentOrder.status === '待付款' || currentOrder.status === '待支付' || currentOrder.status === 'pending')" 
            type="primary" 
            size="large"
            :loading="paymentLoading"
            @click="payOrder(currentOrder)">
            <i class="el-icon-wallet"></i> 立即支付 ¥{{ currentOrder?.total.toFixed(2) }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 页脚 -->
    <div class="footer">
      <p>© 2025 东软网上商城 - 基于Vue.js的购物网站实验项目</p>
      <p>广东东软学院Web前端开发技术课程</p>
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
import Header from '@/components/Header.vue'

export default {
  name: 'OrdersView',
  components: {
    Header
  },
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const router = useRouter()
    
    // 用户登录状态
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    
    // 加载状态
    const loading = ref(true)
    
    // 订单数据 - 使用userOrders而不是orders，确保只显示当前用户的订单
    const orders = computed(() => ordersStore.userOrders)
    
    // 当前选中的标签
    const activeTab = ref('all')
    
    // 根据标签筛选订单
    const filteredOrders = computed(() => {
      if (activeTab.value === 'all') {
        return orders.value
      } else if (activeTab.value === 'pending') {
        // 同时匹配"待付款"和"待支付"状态
        return orders.value.filter(order => order.status === '待付款' || order.status === '待支付' || order.status === 'pending')
      } else if (activeTab.value === 'paid') {
        // 同时匹配"已付款"和"paid"状态
        return orders.value.filter(order => order.status === '已付款' || order.status === 'paid')
      }
      return orders.value
    })
    
    // 订单详情相关
    const detailVisible = ref(false)
    const currentOrder = ref(null)
    const paymentLoading = ref(false)
    
    // 获取订单数据
    onMounted(async () => {
      if (!isLoggedIn.value) return
      
      loading.value = true
      try {
        // 确保订单数据已初始化
        ordersStore.initOrdersData();
        await ordersStore.fetchOrders();
      } catch (error) {
        ElMessage.error('获取订单数据失败');
        console.error(error);
      } finally {
        loading.value = false;
      }
    })
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    
    // 统一订单状态显示
    const getOrderStatusText = (status) => {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'completed': '已完成',
        'cancelled': '已取消',
        '待支付': '待付款',
        '待付款': '待付款',
        '已付款': '已付款',
        '已发货': '已发货',
        '已送达': '已送达',
        '已完成': '已完成',
        '已取消': '已取消'
      }
      return statusMap[status] || status
    }
    
    // 获取订单状态类型（用于样式）
    const getOrderStatusType = (status) => {
      // 先统一转换状态文本
      const normalizedStatus = getOrderStatusText(status)
      
      // 根据统一后的状态文本返回对应的类型
      const typeMap = {
        '待付款': 'pending',
        '已付款': 'paid',
        '已发货': 'shipped',
        '已送达': 'delivered',
        '已完成': 'completed',
        '已取消': 'cancelled'
      }
      
      return typeMap[normalizedStatus] || 'unknown'
    }
    
    // 格式化地址
    const formatAddress = (address) => {
      if (!address) return '-'
      return `${address.province}${address.city}${address.district}${address.detail}`
    }
    
    // 获取订单商品总数
    const getTotalItems = (order) => {
      return order.items.reduce((sum, item) => sum + item.quantity, 0)
    }
    
    // 跳转到商品详情
    const goToProduct = (id) => {
      router.push(`/product/${id}`)
    }
    
    // 查看订单详情
    const viewOrderDetail = (order) => {
      currentOrder.value = order
      detailVisible.value = true
    }
    
    // 支付订单
    const payOrder = (order) => {
      // 设置支付中状态
      paymentLoading.value = true
      
      // 如果是从详情对话框支付，先关闭对话框
      if (detailVisible.value) {
        detailVisible.value = false
      }
      
      // 提示用户
      ElMessage.success('正在跳转到支付页面...')
      
      // 模拟支付页 - 保存订单ID到本地存储
      localStorage.setItem('currentOrderId', order.id)
      
      // 延迟一下再跳转，让用户看到提示消息
      setTimeout(() => {
        paymentLoading.value = false
        router.push('/checkout')
      }, 500)
    }
    
    // 显示登录对话框
    const showLoginDialog = () => {
      /* 已移除全局登录状态控制 */
    }
    
    return {
      isLoggedIn,
      loading,
      orders,
      activeTab,
      filteredOrders,
      detailVisible,
      currentOrder,
      paymentLoading,
      formatDate,
      formatAddress,
      getTotalItems,
      goToProduct,
      viewOrderDetail,
      payOrder,
      showLoginDialog,
      getOrderStatusText,
      getOrderStatusType
    }
  }
}
</script>

<style scoped>
.orders-page {
  width: 100%;
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #303133;
}

.loading-container {
  min-height: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.orders-list {
  background-color: #fff;
  border-radius: 4px;
}

.orders-content {
  padding: 20px;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-id {
  font-weight: bold;
  margin-right: 20px;
}

.order-date {
  color: #909399;
}

.order-status {
  font-weight: bold;
  color: #e6a23c;
}

.status-pending {
  color: #e6a23c; /* 橙色 - 待付款 */
}

.status-paid {
  color: #409eff; /* 蓝色 - 已付款 */
}

.status-shipped {
  color: #67c23a; /* 绿色 - 已发货 */
}

.status-delivered {
  color: #67c23a; /* 绿色 - 已送达 */
}

.status-completed {
  color: #67c23a; /* 绿色 - 已完成 */
}

.status-cancelled {
  color: #f56c6c; /* 红色 - 已取消 */
}

.order-items {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.order-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 5px;
}

.item-name:hover {
  color: #409EFF;
}

.item-price {
  color: #909399;
  font-size: 13px;
}

.item-subtotal {
  font-weight: bold;
  color: #f56c6c;
  margin-left: 20px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
}

.address-label {
  color: #909399;
}

.order-total {
  color: #606266;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.orders-empty {
  padding: 50px 0;
  background-color: #fff;
  border-radius: 4px;
}

.order-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.order-payment {
  margin-top: 20px;
  text-align: right;
  padding-right: 20px;
}

.payment-item {
  margin-bottom: 10px;
}

.payment-total {
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
}

.payment-total span:last-child {
  color: #f56c6c;
  font-size: 20px;
}

.footer {
  background-color: #303133;
  color: #fff;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #409eff, #2e88e5);
  border: none;
  padding: 12px 25px;
  transition: all 0.3s;
}

.dialog-footer .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 136, 229, 0.3);
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .page-title {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .order-actions {
    width: 100%;
  }
  
  .order-actions .el-button {
    flex: 1;
  }
}

.login-required {
  background: white;
  border-radius: 8px;
  padding: 40px 20px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-required .el-empty {
  margin: 30px 0;
}

.login-required .el-button {
  margin: 0 10px;
}
</style> 