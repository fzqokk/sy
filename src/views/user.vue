<template>
  <div class="profile-page">
    <div class="container">
      <el-card class="profile-card">
        <template #header>
          <div class="profile-header">
            <h2>个人中心</h2>
            <div class="header-buttons">
              <el-button type="primary" size="small" @click="isEditing = !isEditing">
                {{ isEditing ? '取消编辑' : '编辑资料' }}
              </el-button>
              <el-button size="small" @click="goToHome">
                返回首页
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="profile-info" v-if="!isEditing">
          <div class="profile-avatar">
            <div class="avatar-circle">{{ userInfo.name ? userInfo.name.substring(0, 1).toUpperCase() : userInfo.username ? userInfo.username.substring(0, 1).toUpperCase() : 'U' }}</div>
            <h3 class="user-name">{{ userInfo.name || userInfo.username || '用户' }}</h3>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">账号</span>
              <span class="info-value">{{ userInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机</span>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(userInfo.registerTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-edit" v-else>
          <el-form :model="form" label-width="100px" class="edit-form">
            <el-form-item label="昵称">
              <div class="custom-input">
                <input 
                  v-model="form.name" 
                  placeholder="请输入您的昵称" 
                  type="text"
                  class="native-input">
              </div>
              <div class="form-hint">此昵称将显示在您的个人资料和评论中</div>
            </el-form-item>
            <el-form-item label="邮箱">
              <div class="custom-input">
                <input 
                  v-model="form.email" 
                  placeholder="请输入邮箱" 
                  type="email"
                  class="native-input">
              </div>
            </el-form-item>
            <el-form-item label="手机">
              <div class="custom-input">
                <input 
                  v-model="form.phone" 
                  placeholder="请输入手机号" 
                  type="tel"
                  class="native-input">
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存信息</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      
      <div class="profile-sections">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <h3>账号安全</h3>
            </div>
          </template>
          <div class="section-content">
            <div class="security-item">
              <div class="security-info">
                <i class="el-icon-lock"></i>
                <div class="security-text">
                  <div class="security-title">修改密码</div>
                  <div class="security-desc">定期修改密码可以保护账号安全</div>
                </div>
              </div>
              <el-button type="primary" text @click="openPasswordDialog">修改</el-button>
            </div>
          </div>
        </el-card>
        
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <h3>最近订单</h3>
              <el-button type="primary" text @click="goToOrders">查看全部</el-button>
            </div>
          </template>
          <div class="section-content" v-if="recentOrders.length > 0">
            <div class="order-item" v-for="order in recentOrders" :key="order.id">
              <div class="order-date">{{ formatDate(order.createdAt) }}</div>
              <div class="order-info">
                <div class="order-id">订单号: {{ order.id }}</div>
                <div class="order-items-info">
                  {{ order.items.length > 1 
                    ? `${order.items[0].name} 等${order.items.length}件商品` 
                    : order.items[0]?.name || '未知商品' }}
                </div>
                <div class="order-price">¥{{ order.total.toFixed(2) }}</div>
              </div>
              <div class="order-status" :class="'status-' + getStatusClass(order.status)">{{ order.status }}</div>
            </div>
          </div>
          <div class="empty-content" v-else>
            <i class="el-icon-shopping-bag-2"></i>
            <p>您还没有订单记录</p>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :append-to-body="true"
      :destroy-on-close="true"
      :show-close="true">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item prop="oldPassword" label="当前密码">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="passwordForm.oldPassword" 
              placeholder="请输入当前密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="passwordForm.newPassword" 
              placeholder="请输入新密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认新密码">
          <div class="custom-input">
            <i class="el-icon-lock"></i>
            <input 
              v-model="passwordForm.confirmPassword" 
              placeholder="请再次输入新密码" 
              type="password"
              class="native-input">
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="isSubmitting">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'ProfilePage',
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const router = useRouter()
    
    // 用户信息
    const userInfo = computed(() => userStore.currentUser || {})
    
    // 编辑状态
    const isEditing = ref(false)
    
    // 修改密码对话框
    const passwordDialogVisible = ref(false)
    const isSubmitting = ref(false)
    
    // 编辑表单
    const form = reactive({
      username: '',
      name: '',
      email: '',
      phone: ''
    })
    
    // 密码表单
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 密码表单验证规则
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }
    
    // 最近订单数据
    const recentOrders = computed(() => {
      // 从store中获取所有订单
      const allOrders = ordersStore.userOrders || []
      // 按日期排序并只返回最近3个订单
      return [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
    })
    
    // 监听用户信息变化，更新表单数据
    watch(() => userInfo.value, (newUserInfo) => {
      if (newUserInfo) {
        form.username = newUserInfo.username || ''
        form.name = newUserInfo.name || ''
        form.email = newUserInfo.email || ''
        form.phone = newUserInfo.phone || ''
      }
    }, { deep: true })
    
    // 初始化
    onMounted(async () => {
      // 如果未登录，跳转回首页
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push('/')
        return
      }
      
      // 获取最新订单数据
      try {
        // 确保订单数据已初始化
        ordersStore.initOrdersData()
        await ordersStore.fetchOrders()
        console.log('个人资料页面订单数据加载成功')
      } catch (error) {
        console.error('获取订单数据失败:', error)
      }
    })
    
    // 加载最近订单方法（用于刷新订单数据）
    const loadRecentOrders = async () => {
      try {
        await ordersStore.fetchOrders()
      } catch (error) {
        console.error('刷新订单数据失败:', error)
      }
    }
    
    // 保存个人资料
    const saveProfile = () => {
      // 从localStorage获取所有用户
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const currentUser = users.find(u => u.username === userInfo.value.username)
      
      if (currentUser) {
        // 更新用户信息
        currentUser.name = form.name
        currentUser.email = form.email
        currentUser.phone = form.phone
        
        // 保存到localStorage
        localStorage.setItem('users', JSON.stringify(users))
        
        // 更新当前用户信息
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
        userStore.login(currentUser)
        
        ElMessage.success('个人资料更新成功')
        isEditing.value = false
        
        // 刷新订单数据
        loadRecentOrders()
      }
    }
    
    // 使用表单验证的ref
    const passwordFormRef = ref(null)
    
    // 打开修改密码对话框
    const openPasswordDialog = () => {
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordDialogVisible.value = true
    }
    
    // 修改密码
    const changePassword = () => {
      if (passwordFormRef.value) {
        passwordFormRef.value.validate((valid) => {
          if (valid) {
            isSubmitting.value = true
            
            // 从localStorage获取所有用户
            const users = JSON.parse(localStorage.getItem('users') || '[]')
            const currentUser = users.find(u => u.username === userInfo.value.username)
            
            // 验证旧密码
            if (currentUser && currentUser.password === passwordForm.oldPassword) {
              // 更新密码
              currentUser.password = passwordForm.newPassword
              
              // 保存到localStorage
              localStorage.setItem('users', JSON.stringify(users))
              
              // 提示成功
              ElMessage.success('密码修改成功')
              passwordDialogVisible.value = false
            } else {
              ElMessage.error('当前密码不正确')
            }
            
            isSubmitting.value = false
          }
        })
      } else {
        ElMessage.warning('表单验证失败，请检查输入')
      }
    }
    
    // 跳转到订单中心
    const goToOrders = () => {
      router.push('/orders')
    }
    
    // 跳转到首页
    const goToHome = () => {
      router.push('/')
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知日期'
      
      try {
        const date = new Date(dateString)
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
      } catch (e) {
        return '日期格式错误'
      }
    }
    
    // 补零函数
    const padZero = (num) => {
      return num < 10 ? '0' + num : num
    }
    
    // 获取订单状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || '未知状态'
    }
    
    // 获取订单状态类
    const getStatusClass = (status) => {
      const statusMap = {
        '待付款': 'pending',
        '已付款': 'paid',
        '已发货': 'shipped',
        '已送达': 'delivered',
        '已完成': 'completed',
        '已取消': 'cancelled'
      }
      return statusMap[status] || 'unknown'
    }
    
    return {
      userInfo,
      isEditing,
      form,
      passwordDialogVisible,
      passwordForm,
      passwordRules,
      passwordFormRef,
      isSubmitting,
      recentOrders,
      saveProfile,
      openPasswordDialog,
      changePassword,
      goToOrders,
      goToHome,
      formatDate,
      getStatusText,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.profile-page {
  background-color: var(--gray-100);
  min-height: calc(100vh - 68px);
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 15px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.profile-card {
  grid-column: 1 / 2;
  min-height: 400px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  transform: translateY(-5px);
}

.profile-sections {
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  transform: translateY(-5px);
}

.profile-header,
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-radius: 15px 15px 0 0;
}

.profile-header h2,
.section-header h3 {
  margin: 0;
  color: var(--gray-800);
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
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
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 15px;
  box-shadow: 0 8px 15px rgba(74, 108, 247, 0.25);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(74, 108, 247, 0.3);
}

.user-name {
  font-size: 24px;
  color: var(--gray-800);
  margin: 10px 0;
  font-weight: 600;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px 30px;
}

.info-item {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.info-item:hover {
  border-bottom-color: var(--primary-light);
}

.info-label {
  width: 100px;
  color: var(--gray-600);
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: var(--gray-800);
  font-weight: 500;
}

.edit-form {
  margin-top: 20px;
  padding: 0 20px 20px;
}

.form-hint {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 6px;
}

.section-content {
  padding: 20px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.security-item:last-child {
  border-bottom: none;
}

.security-item:hover {
  background-color: rgba(74, 108, 247, 0.03);
}

.security-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.security-info i {
  font-size: 24px;
  color: var(--primary-color);
  background: rgba(74, 108, 247, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.security-item:hover .security-info i {
  background: rgba(74, 108, 247, 0.2);
  transform: scale(1.05);
}

.security-title {
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 6px;
  font-size: 16px;
}

.security-desc {
  font-size: 13px;
  color: var(--gray-500);
}

.order-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  padding: 20px 0;
  border-bottom: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item:hover {
  background-color: rgba(74, 108, 247, 0.03);
}

.order-date {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 500;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-id {
  font-size: 15px;
  color: var(--gray-700);
  font-weight: 600;
}

.order-items-info {
  font-size: 14px;
  color: var(--gray-600);
}

.order-price {
  font-weight: 700;
  color: #f56c6c;
  margin-top: 5px;
  font-size: 16px;
}

.order-status {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.status-pending {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.status-paid {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.status-shipped, .status-delivered {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.status-completed {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.status-cancelled {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: var(--gray-500);
}

.empty-content i {
  font-size: 50px;
  margin-bottom: 15px;
  color: var(--gray-400);
}

.empty-content p {
  margin: 0;
  font-size: 15px;
}

.custom-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  padding: 0 15px;
  height: 45px;
  transition: all 0.3s;
  background-color: white;
}

.custom-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

.custom-input i {
  color: var(--gray-500);
  font-size: 18px;
  margin-right: 10px;
}

.native-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  height: 100%;
  font-size: 15px;
  color: var(--gray-900);
}

.native-input::placeholder {
  color: var(--gray-400);
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.header-buttons .el-button {
  border-radius: 10px;
  padding: 10px 15px;
  transition: all 0.3s;
}

.header-buttons .el-button--primary {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  border: none;
}

.header-buttons .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 108, 247, 0.25);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
  
  .profile-card,
  .profile-sections {
    grid-column: 1;
  }
  
  .profile-page {
    padding: 20px 0;
  }
  
  .avatar-circle {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  
  .user-name {
    font-size: 20px;
  }
}
</style> 