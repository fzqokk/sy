<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <h1>系统管理后台</h1>
        <p>欢迎回来，{{ userInfo.name }}</p>
      </div>
      <div class="header-right">
        <el-button type="primary" plain size="small" @click="goToHome">
          <i class="el-icon-back"></i> 返回首页
        </el-button>
      </div>
    </div>
    
    <div class="container">
      <div class="dashboard-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-user"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ userCount }}</div>
                  <div class="stat-label">用户总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-s-shop"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ shopCount }}</div>
                  <div class="stat-label">店铺总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-s-goods"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ productCount }}</div>
                  <div class="stat-label">商品总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-s-data"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">¥{{ totalSales.toFixed(2) }}</div>
                  <div class="stat-label">平台总销售额</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="dashboard-main">
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 用户管理 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>用户管理</h3>
                  <el-button type="primary" size="small" @click="handleAddUser">添加用户</el-button>
                </div>
              </template>
              <el-table :data="users" style="width: 100%" v-if="users.length > 0">
                <el-table-column prop="username" label="用户名" width="120"></el-table-column>
                <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
                <el-table-column prop="role" label="角色" width="100">
                  <template #default="scope">
                    <el-tag :type="getUserRoleType(scope.row.role)">
                      {{ getUserRoleText(scope.row.role) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="registerTime" label="注册时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.registerTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-switch
                      v-model="scope.row.active"
                      :active-value="true"
                      :inactive-value="false"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      @change="(val) => handleToggleUserStatus(scope.row, val)"
                      :disabled="scope.row.username === 'admin'">
                    </el-switch>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="260" fixed="right">
                  <template #default="scope">
                    <el-button-group>
                      <el-button size="small" type="primary" @click="handleEditUser(scope.row)">
                        编辑
                      </el-button>
                      <el-button size="small" type="info" @click="handleViewUserOrders(scope.row)">
                        查看订单
                      </el-button>
                      <el-button 
                        size="small" 
                        type="danger" 
                        @click="handleDeleteUser(scope.row)"
                        :disabled="scope.row.username === 'admin'">
                        删除
                      </el-button>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
              <div class="empty-data" v-else>
                <i class="el-icon-user"></i>
                <p>暂无用户数据</p>
              </div>
            </el-card>
            
            <!-- 商家管理 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>商家管理</h3>
                  <el-button type="primary" text>查看全部</el-button>
                </div>
              </template>
              <el-table :data="shops" style="width: 100%" v-if="shops.length > 0">
                <el-table-column prop="id" label="店铺ID" width="100"></el-table-column>
                <el-table-column prop="name" label="店铺名称"></el-table-column>
                <el-table-column prop="owner" label="店主"></el-table-column>
                <el-table-column prop="productCount" label="商品数"></el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag :type="getShopStatusType(scope.row.status)">
                      {{ getShopStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" type="primary" plain @click="handleViewShop(scope.row)">
                      查看
                    </el-button>
                    <el-button size="small" type="danger" plain v-if="scope.row.status === 'active'" @click="handleToggleShopStatus(scope.row, 'inactive')">
                      禁用
                    </el-button>
                    <el-button size="small" type="success" plain v-else @click="handleToggleShopStatus(scope.row, 'active')">
                      启用
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="empty-data" v-else>
                <i class="el-icon-office-building"></i>
                <p>暂无商家数据</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <!-- 系统公告 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>系统公告</h3>
                  <el-button type="primary" size="small" @click="handleAddAnnouncement">发布公告</el-button>
                </div>
              </template>
              <div class="announcement-list">
                <div class="announcement-item" v-for="(item, index) in announcements" :key="index">
                  <div class="announcement-title">{{ item.title }}</div>
                  <div class="announcement-content">{{ item.content }}</div>
                  <div class="announcement-footer">
                    <span class="announcement-time">{{ item.time }}</span>
                    <div class="announcement-actions">
                      <el-button type="primary" text size="small" @click="handleEditAnnouncement(item)">编辑</el-button>
                      <el-button type="primary" text size="small" @click="handleDeleteAnnouncement(item)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-data" v-if="announcements.length === 0">
                <i class="el-icon-bell"></i>
                <p>暂无系统公告</p>
              </div>
            </el-card>
            
            <!-- 系统设置 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>系统设置</h3>
                  <el-button type="primary" text @click="handleSaveSettings">保存设置</el-button>
                </div>
              </template>
              <el-form :model="systemSettings" label-width="120px" class="settings-form">
                <el-form-item label="网站名称">
                  <el-input v-model="systemSettings.siteName"></el-input>
                </el-form-item>
                <el-form-item label="网站描述">
                  <el-input type="textarea" v-model="systemSettings.description" :rows="2"></el-input>
                </el-form-item>
                <el-form-item label="注册审核">
                  <el-switch v-model="systemSettings.requireApproval"></el-switch>
                </el-form-item>
                <el-form-item label="店铺审核">
                  <el-switch v-model="systemSettings.shopApproval"></el-switch>
                </el-form-item>
                <el-form-item label="平台佣金">
                  <el-input-number v-model="systemSettings.commission" :min="0" :max="100" :step="0.5" step-strictly></el-input-number>
                  <span class="form-label-suffix">%</span>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="editingUser.id ? '编辑用户' : '添加用户'"
      width="500px"
      @close="resetUserForm">
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
        class="user-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="editingUser.id"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" class="w-100">
            <el-option label="买家" value="buyer"></el-option>
            <el-option label="卖家" value="seller"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editingUser.id">
          <el-input v-model="userForm.password" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser" :loading="saving">
            {{ editingUser.id ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用户订单查看对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="用户订单数据"
      width="800px">
      <div v-if="selectedUser" class="user-order-info">
        <div class="user-info-header">
          <h3>{{ selectedUser.name }} ({{ selectedUser.username }}) 的订单数据</h3>
          <p>共 {{ userOrders.length }} 条订单记录</p>
        </div>
        
        <el-table :data="userOrders" style="width: 100%" v-if="userOrders.length > 0">
          <el-table-column prop="id" label="订单ID" width="120"></el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="商品数量" width="100">
            <template #default="scope">
              {{ scope.row.items?.length || 0 }} 件
            </template>
          </el-table-column>
          <el-table-column label="订单金额" width="120">
            <template #default="scope">
              ¥{{ scope.row.total?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态">
            <template #default="scope">
              <el-tag :type="getOrderStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="empty-data" v-else>
          <i class="el-icon-document"></i>
          <p>该用户暂无订单数据</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrdersStore } from '@/stores/ordersStore'
import { useCartStore } from '@/stores/cartStore'

/**
 * 管理员后台组件
 * 提供系统管理功能，包括用户管理、商家管理、系统公告和系统设置
 * 仅限管理员角色访问
 */
export default {
  name: 'AdminDashboard',
  setup() {
    const userStore = useUserStore()
    const ordersStore = useOrdersStore()
    const cartStore = useCartStore()
    const router = useRouter()
    const userFormRef = ref(null)  // 添加userFormRef的定义
    
    /**
     * 获取当前登录的管理员用户信息
     * 用于显示欢迎信息和进行权限验证
     */
    const userInfo = computed(() => {
      const user = userStore.currentUser
      return user || { name: '未登录用户', role: '' }  // 提供默认值
    })
    
    /**
     * 系统统计数据
     * 在实际项目中应从后端API获取真实数据
     */
    const userCount = ref(128)     // 用户总数
    const shopCount = ref(24)      // 店铺总数
    const productCount = ref(356)  // 商品总数
    const totalSales = ref(158960.50) // 平台总销售额
    
    /**
     * 用户列表数据
     * 在实际项目中应从用户管理API获取
     */
    const users = ref([])  // 修改为空数组初始值
    
    /**
     * 商家列表数据
     * 在实际项目中应从商家管理API获取
     */
    const shops = ref([
      {
        id: 'S001',
        name: '优品服装店',
        owner: '卖家用户1',
        productCount: 45,
        status: 'active'
      },
      {
        id: 'S002',
        name: '数码配件店',
        owner: '卖家用户2',
        productCount: 28,
        status: 'active'
      },
      {
        id: 'S003',
        name: '家居日用品',
        owner: '卖家用户3',
        productCount: 36,
        status: 'pending'
      }
    ])
    
    /**
     * 系统公告数据
     * 管理员可发布、编辑和删除系统公告
     */
    const announcements = ref([
      {
        id: 1,
        title: '系统升级通知',
        content: '系统将于2023年5月30日晚上23:00-24:00进行例行维护升级，期间部分功能可能暂时无法使用。',
        time: '2023-05-25 14:30'
      },
      {
        id: 2,
        title: '新功能上线预告',
        content: '我们将在下周推出全新的商家分析功能，敬请期待！',
        time: '2023-05-20 10:15'
      }
    ])
    
    /**
     * 系统设置数据
     * 管理员可配置系统基本参数
     */
    const systemSettings = reactive({
      siteName: 'fzq的小商城',        // 网站名称
      description: '一个便捷的电商平台',  // 网站描述
      requireApproval: false,         // 用户注册是否需要审核
      shopApproval: true,             // 店铺是否需要审核
      commission: 5.0                 // 平台佣金比例
    })
    
    /**
     * 用户表单相关数据
     */
    const userDialogVisible = ref(false)
    const editingUser = ref({})
    const saving = ref(false)
    
    const userForm = reactive({
      username: '',
      name: '',
      email: '',
      role: 'buyer',
      password: '',
      active: true
    })
    
    const userFormRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur', required: !editingUser.value.id },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
    }
    
    /**
     * 组件挂载时执行的初始化函数
     * 检查用户权限并加载管理员数据
     */
    onMounted(() => {
      // 管理员权限验证 - 阻止非管理员访问后台
      if (!userInfo.value || userInfo.value.role !== 'admin') {
        ElMessage.warning('您没有访问管理后台的权限')
        router.push('/')
        return
      }
      
      // 加载用户列表
      loadUsers()
      
      // 加载统计数据
      loadStatisticsData()
    })
    
    /**
     * 加载管理员数据
     * 在实际项目中应从API获取各类数据
     */
    const loadAdminData = () => {
      // 实际应用中这里会从API获取数据
      console.log('加载管理员数据')
    }
    
    /**
     * 加载统计数据
     * 从localStorage中获取各种统计数据
     */
    const loadStatisticsData = () => {
      try {
        // 1. 加载用户总数
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        userCount.value = users.length
        
        // 2. 加载店铺总数
        const shops = JSON.parse(localStorage.getItem('shops') || '[]')
        shopCount.value = shops.length
        
        // 3. 加载商品总数
        const products = JSON.parse(localStorage.getItem('products') || '[]')
        productCount.value = products.length
        
        // 4. 计算平台总销售额
        const ordersMap = JSON.parse(localStorage.getItem('ordersMap') || '{}')
        let totalAmount = 0
        
        // 遍历所有用户的订单
        Object.values(ordersMap).forEach(userOrders => {
          // 只计算已付款、已发货、已送达、已完成状态的订单
          userOrders.forEach(order => {
            if (['已付款', '已发货', '已送达', '已完成'].includes(order.status)) {
              totalAmount += order.total || 0
            }
          })
        })
        
        totalSales.value = totalAmount
        
        console.log('统计数据加载完成:', {
          userCount: userCount.value,
          shopCount: shopCount.value,
          productCount: productCount.value,
          totalSales: totalSales.value
        })
      } catch (error) {
        console.error('加载统计数据失败:', error)
        ElMessage.error('加载统计数据失败')
      }
    }
    
    /**
     * 获取用户角色对应的标签类型（用于显示不同颜色）
     * @param {string} role - 用户角色
     * @returns {string} Element Plus Tag组件的类型
     */
    const getUserRoleType = (role) => {
      const roleMap = {
        'admin': 'danger',   // 管理员 - 红色
        'seller': 'warning', // 卖家 - 黄色
        'buyer': 'success'   // 买家 - 绿色
      }
      return roleMap[role] || 'info'
    }
    
    /**
     * 获取用户角色的中文显示文本
     * @param {string} role - 用户角色
     * @returns {string} 角色的中文名称
     */
    const getUserRoleText = (role) => {
      const roleMap = {
        'admin': '管理员',
        'seller': '卖家',
        'buyer': '买家'
      }
      return roleMap[role] || '未知角色'
    }
    
    /**
     * 获取店铺状态对应的标签类型（用于显示不同颜色）
     * @param {string} status - 店铺状态
     * @returns {string} Element Plus Tag组件的类型
     */
    const getShopStatusType = (status) => {
      const statusMap = {
        'active': 'success',   // 正常 - 绿色
        'inactive': 'info',    // 已禁用 - 灰色
        'pending': 'warning',  // 待审核 - 黄色
        'rejected': 'danger'   // 已拒绝 - 红色
      }
      return statusMap[status] || 'info'
    }
    
    /**
     * 获取店铺状态的中文显示文本
     * @param {string} status - 店铺状态
     * @returns {string} 状态的中文名称
     */
    const getShopStatusText = (status) => {
      const statusMap = {
        'active': '正常',
        'inactive': '已禁用',
        'pending': '待审核',
        'rejected': '已拒绝'
      }
      return statusMap[status] || '未知状态'
    }
    
    /**
     * 重置用户表单
     */
    const resetUserForm = () => {
      if (userFormRef.value) {
        userFormRef.value.resetFields()
      }
      editingUser.value = {}
      Object.assign(userForm, {
        username: '',
        name: '',
        email: '',
        role: 'buyer',
        password: '',
        active: true
      })
    }
    
    /**
     * 处理添加用户
     */
    const handleAddUser = () => {
      resetUserForm()
      userDialogVisible.value = true
    }
    
    /**
     * 处理编辑用户
     * @param {Object} user - 用户对象
     */
    const handleEditUser = (user) => {
      editingUser.value = { ...user }  // 创建用户对象的副本
      Object.assign(userForm, {
        username: user.username,
        name: user.name,
        email: user.email || '',  // 提供默认值
        role: user.role,
        active: user.active ?? true  // 提供默认值
      })
      userDialogVisible.value = true
    }
    
    /**
     * 处理删除用户
     * @param {Object} user - 用户对象
     */
    const handleDeleteUser = (user) => {
      if (user.username === 'admin') {
        ElMessage.warning('不能删除管理员账号')
        return
      }
      
      ElMessageBox.confirm(
        `确认删除用户"${user.name}"吗？此操作将同时删除该用户的所有订单数据和购物车数据，且不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        try {
          // 1. 获取所有用户
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          const index = users.findIndex(u => u.id === user.id)
          
          if (index !== -1) {
            // 2. 删除用户
            const deletedUser = users[index]
            users.splice(index, 1)
            localStorage.setItem('users', JSON.stringify(users))
            
            // 3. 删除用户的订单数据 - 使用专门的方法
            ordersStore.initOrdersData() // 确保订单数据已加载
            ordersStore.clearUserOrders(deletedUser)
            
            // 4. 清除用户的购物车数据
            // 清除基于用户ID的购物车
            if (deletedUser && deletedUser.id) {
              localStorage.removeItem(`cart_${deletedUser.id}`)
            }
            
            // 清除基于用户名的购物车（兼容旧数据）
            localStorage.removeItem(`cart_${deletedUser.username}`)
            
            // 5. 删除用户可能创建的店铺数据
            if (deletedUser.role === 'seller') {
              const shops = JSON.parse(localStorage.getItem('shops') || '[]')
              // 同时检查ID和用户名
              const shopIndex = shops.findIndex(shop => 
                shop.ownerId === user.id || 
                shop.ownerUsername === user.username ||
                shop.owner === user.username
              )
              if (shopIndex !== -1) {
                shops.splice(shopIndex, 1)
                localStorage.setItem('shops', JSON.stringify(shops))
              }
            }
            
            // 6. 如果该用户当前已登录，强制登出
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
            if (currentUser && (currentUser.id === user.id || currentUser.username === user.username)) {
              localStorage.removeItem('currentUser')
              ElMessage.info('已强制登出被删除的用户')
            }
            
            ElMessage.success('用户及其所有数据已删除成功')
            loadUsers() // 重新加载用户列表
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          ElMessage.error('删除失败，请重试')
        }
      }).catch(() => {})
    }
    
    /**
     * 处理用户状态切换
     * @param {Object} user - 用户对象
     * @param {boolean} status - 新状态，true为启用，false为禁用
     */
    const handleToggleUserStatus = (user, status) => {
      if (user.username === 'admin') {
        ElMessage.warning('不能修改管理员状态')
        return
      }
      
      // 添加确认对话框
      const actionText = status ? '启用' : '禁用'
      ElMessageBox.confirm(
        `确认${actionText}用户"${user.name}"吗？${!status ? '禁用后该用户将无法登录系统。' : ''}`,
        `${actionText}确认`,
        {
          confirmButtonText: `确认${actionText}`,
          cancelButtonText: '取消',
          type: status ? 'success' : 'warning'
        }
      ).then(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          const index = users.findIndex(u => u.id === user.id)
          if (index !== -1) {
            users[index].active = status
            localStorage.setItem('users', JSON.stringify(users))
            
            // 如果当前禁用的用户已登录，强制登出
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
            if (!status && currentUser && currentUser.id === user.id) {
              localStorage.removeItem('currentUser')
              ElMessage.info('已强制登出被禁用的用户')
            }
            
            ElMessage.success(`用户${user.name}已${actionText}`)
          }
        } catch (error) {
          console.error('更新用户状态失败:', error)
          ElMessage.error('操作失败，请重试')
        }
      }).catch(() => {
        // 取消操作时恢复开关状态
        user.active = !status
      })
    }
    
    /**
     * 处理查看店铺
     * @param {Object} shop - 店铺对象
     */
    const handleViewShop = (shop) => {
      console.log('查看店铺', shop)
      // 这里可以实现查看店铺的逻辑
    }
    
    /**
     * 处理店铺状态切换
     * @param {Object} shop - 店铺对象
     * @param {string} status - 新状态，'active'为启用，'inactive'为禁用
     */
    const handleToggleShopStatus = (shop, status) => {
      ElMessageBox.confirm(
        `确认${status === 'active' ? '启用' : '禁用'}店铺"${shop.name}"吗？`,
        '状态确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        shop.status = status
        const actionText = status === 'active' ? '启用' : '禁用'
        ElMessage.success(`店铺已${actionText}`)
      }).catch(() => {
        // 如果取消则恢复开关状态
        shop.status = shop.status === 'active' ? 'inactive' : 'active'
      })
    }
    
    /**
     * 处理添加公告
     */
    const handleAddAnnouncement = () => {
      console.log('添加公告')
      // 这里可以实现添加公告的逻辑
    }
    
    /**
     * 处理编辑公告
     * @param {Object} announcement - 公告对象
     */
    const handleEditAnnouncement = (announcement) => {
      console.log('编辑公告', announcement)
      // 这里可以实现编辑公告的逻辑
    }
    
    /**
     * 处理删除公告
     * @param {Object} announcement - 公告对象
     */
    const handleDeleteAnnouncement = (announcement) => {
      ElMessageBox.confirm(
        `确认删除公告"${announcement.title}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 这里处理删除逻辑
        ElMessage.success('公告删除成功')
      }).catch(() => {})
    }
    
    /**
     * 处理保存系统设置
     */
    const handleSaveSettings = () => {
      ElMessage.success('系统设置保存成功')
    }
    
    /**
     * 处理保存用户
     */
    const handleSaveUser = async () => {
      if (!userFormRef.value) return
      
      try {
        const valid = await userFormRef.value.validate()
        if (valid) {
          saving.value = true
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          
          if (editingUser.value.id) {
            // 更新现有用户
            const index = users.findIndex(u => u.id === editingUser.value.id)
            if (index !== -1) {
              users[index] = {
                ...users[index],
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                active: userForm.active,
                updateTime: new Date().toISOString()
              }
            }
          } else {
            // 创建新用户
            if (users.some(u => u.username === userForm.username)) {
              ElMessage.error('用户名已存在')
              return
            }
            
            // 确保生成唯一ID，避免与已删除用户的ID或用户名冲突
            const uniqueId = `U${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            
            users.push({
              id: uniqueId,
              username: userForm.username,
              name: userForm.name,
              email: userForm.email,
              role: userForm.role,
              password: userForm.password,
              active: userForm.active,
              registerTime: new Date().toISOString()
            })
          }
          
          localStorage.setItem('users', JSON.stringify(users))
          ElMessage.success(editingUser.value.id ? '用户更新成功' : '用户创建成功')
          userDialogVisible.value = false
          loadUsers() // 重新加载用户列表
        }
      } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        saving.value = false
      }
    }
    
    /**
     * 加载用户列表
     */
    const loadUsers = () => {
      try {
        const loadedUsers = JSON.parse(localStorage.getItem('users') || '[]')
        users.value = loadedUsers  // 正确赋值给users.value
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      }
    }
    
    /**
     * 处理返回首页
     */
    const goToHome = () => {
      router.push('/')
    }
    
    // 用户订单查看相关
    const orderDialogVisible = ref(false)
    const selectedUser = ref(null)
    const userOrders = ref([])
    
    // 处理查看用户订单
    const handleViewUserOrders = (user) => {
      selectedUser.value = user
      orderDialogVisible.value = true
      
      // 加载用户订单数据
      ordersStore.initOrdersData() // 确保订单数据已加载
      userOrders.value = ordersStore.ordersMap[user.id] || []
    }
    
    // 获取订单状态对应的标签类型
    const getOrderStatusType = (status) => {
      const statusMap = {
        '待支付': 'warning',
        '已付款': 'info',
        '已发货': 'primary',
        '已送达': 'success',
        '已完成': 'success',
        '已取消': 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    /**
     * 格式化日期显示
     * @param {string} dateString - 日期字符串
     * @param {boolean} includeTime - 是否包含时间，默认false
     * @returns {string} 格式化后的日期字符串
     */
    const formatDate = (dateString, includeTime = false) => {
      if (!dateString) return '未知日期'
      
      try {
        const date = new Date(dateString)
        const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
        
        if (includeTime) {
          return `${formattedDate} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
        }
        
        return formattedDate
      } catch (e) {
        return '日期格式错误'
      }
    }
    
    /**
     * 补零函数，将个位数前面补0
     * @param {number} num - 需要补零的数字
     * @returns {string} 补零后的字符串
     */
    const padZero = (num) => {
      return num < 10 ? '0' + num : num
    }
    
    return {
      userInfo,
      userCount,
      shopCount,
      productCount,
      totalSales,
      users,
      shops,
      announcements,
      systemSettings,
      userDialogVisible,
      editingUser,
      saving,
      userForm,
      userFormRef,
      userFormRules,
      getUserRoleType,
      getUserRoleText,
      getShopStatusType,
      getShopStatusText,
      handleAddUser,
      handleEditUser,
      handleDeleteUser,
      handleToggleUserStatus,
      handleViewShop,
      handleToggleShopStatus,
      handleAddAnnouncement,
      handleEditAnnouncement,
      handleDeleteAnnouncement,
      handleSaveSettings,
      handleSaveUser,
      resetUserForm,
      loadUsers,
      goToHome,
      orderDialogVisible,
      selectedUser,
      userOrders,
      handleViewUserOrders,
      getOrderStatusType,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  background-color: var(--gray-100);
  min-height: calc(100vh - 68px);
  padding-bottom: 40px;
}

.dashboard-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  margin-bottom: -30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 50px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-right {
  display: flex;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.dashboard-header p {
  margin: 10px 0 0;
  opacity: 0.9;
}

.dashboard-stats {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 26px;
  color: white;
}

.stat-data {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--gray-600);
  margin-top: 5px;
}

.dashboard-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: var(--gray-500);
}

.empty-data i {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-data p {
  margin: 0;
  font-size: 14px;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.announcement-item {
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 15px;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: 8px;
}

.announcement-content {
  font-size: 14px;
  color: var(--gray-600);
  line-height: 1.5;
  margin-bottom: 10px;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-time {
  font-size: 12px;
  color: var(--gray-500);
}

.announcement-actions {
  display: flex;
  gap: 10px;
}

.settings-form {
  margin-top: 10px;
}

.form-label-suffix {
  margin-left: 5px;
  color: var(--gray-600);
}

.user-form {
  padding: 20px;
}

.w-100 {
  width: 100%;
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
}

.user-order-info {
  padding: 10px 0;
}

.user-info-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 10px;
}

.user-info-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: var(--gray-800);
}

.user-info-header p {
  margin: 0;
  color: var(--gray-600);
  font-size: 14px;
}
</style> 