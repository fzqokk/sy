<template>
  <div class="seller-dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <h1>卖家管理后台</h1>
        <p>欢迎回来，{{ userInfo.name }}</p>
      </div>
      <div class="header-right">
        <el-button type="success" plain size="small" @click="refreshStatistics" style="margin-right: 10px;">
          <i class="el-icon-refresh"></i> 刷新统计
        </el-button>
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
                  <i class="el-icon-s-goods"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ productCount }}</div>
                  <div class="stat-label">商品数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-s-order"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ orderCount }}</div>
                  <div class="stat-label">订单数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-money"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">¥{{ totalSales.toFixed(2) }}</div>
                  <div class="stat-label">总销售额</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="el-icon-user"></i>
                </div>
                <div class="stat-data">
                  <div class="stat-value">{{ customerCount }}</div>
                  <div class="stat-label">客户数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="dashboard-main">
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 最近订单 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>最近订单</h3>
                  <el-button type="primary" :text="true" @click="showAllOrders">查看全部</el-button>
                </div>
              </template>
              <el-table :data="recentOrders" style="width: 100%" v-if="recentOrders.length > 0">
                <el-table-column prop="id" label="订单编号" width="100"></el-table-column>
                <el-table-column prop="customerName" label="客户" width="120"></el-table-column>
                <el-table-column prop="date" label="下单时间" width="180"></el-table-column>
                <el-table-column label="商品信息" width="200">
                  <template #default="scope">
                    {{ scope.row.itemsDescription }}
                  </template>
                </el-table-column>
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
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" type="primary" plain @click="handleViewOrder(scope.row)">
                      查看
                    </el-button>
                    <el-button 
                      size="small" 
                      type="success" 
                      plain 
                      @click="handleProcessOrder(scope.row)" 
                      v-if="scope.row.status === 'paid' || scope.row.status === '已付款'">
                      发货
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="empty-data" v-else-if="!hasBuyerUsers">
                <i class="el-icon-user"></i>
                <p>系统中还没有买家用户，暂无订单数据</p>
                <el-button type="primary" size="small" @click="goToHome" style="margin-top: 15px;">返回首页</el-button>
              </div>
              <div class="empty-data" v-else>
                <i class="el-icon-document"></i>
                <p>暂无订单数据</p>
              </div>
            </el-card>
            
            <!-- 商品管理 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>商品管理</h3>
                  <div class="card-actions">
                    <el-button type="warning" size="small" plain @click="showDeletedProducts">
                      <i class="el-icon-delete"></i> 已删除商品
                    </el-button>
                  <el-button type="primary" size="small" @click="handleAddProduct">添加商品</el-button>
                  </div>
                </div>
              </template>
              <el-table :data="products" style="width: 100%" v-if="products.length > 0">
                <el-table-column prop="id" label="商品ID" width="100"></el-table-column>
                <el-table-column prop="name" label="商品名称"></el-table-column>
                <el-table-column prop="price" label="价格">
                  <template #default="scope">
                    ¥{{ scope.row.price.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="inventory" label="库存"></el-table-column>
                <el-table-column prop="sales" label="销量"></el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" type="primary" plain @click="handleEditProduct(scope.row)">
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" plain @click="handleDeleteProduct(scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="empty-data" v-else>
                <i class="el-icon-goods"></i>
                <p>暂无商品数据，请添加商品</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <!-- 店铺信息 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>店铺信息</h3>
                  <el-button type="primary" :text="true" @click="handleEditShop">编辑</el-button>
                </div>
              </template>
              <div class="shop-info">
                <div class="shop-logo">
                  <img :src="shopInfo.logo || 'https://picsum.photos/80'" alt="店铺Logo">
                </div>
                <div class="shop-details">
                  <h4>{{ shopInfo.name || '我的店铺' }}</h4>
                  <p>{{ shopInfo.description || '暂无店铺描述' }}</p>
                  <div class="shop-data">
                    <div class="data-row">
                      <div class="data-item">
                        <div class="data-label">创建时间</div>
                        <div class="data-value">{{ formatDate(shopInfo.createdAt) }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">店铺分类</div>
                        <div class="data-value">{{ shopInfo.category || '未分类' }}</div>
                      </div>
                    </div>
                    <div class="data-row">
                      <div class="data-item">
                        <div class="data-label">联系电话</div>
                        <div class="data-value">{{ shopInfo.phone || '未设置' }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">店铺状态</div>
                        <div class="data-value">
                          <el-tag type="success" size="small">营业中</el-tag>
                        </div>
                      </div>
                    </div>
                    <div class="data-row">
                      <div class="data-item full-width">
                        <div class="data-label">店铺地址</div>
                        <div class="data-value">{{ shopInfo.address || '未设置' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
            
            <!-- 待办事项 -->
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <h3>待办事项</h3>
                </div>
              </template>
              <div class="todo-list">
                <div class="todo-item" v-for="(item, index) in todoItems" :key="index">
                  <div class="todo-icon" :class="item.type">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="todo-content">
                    <div class="todo-title">{{ item.title }}</div>
                    <div class="todo-desc">{{ item.desc }}</div>
                  </div>
                  <el-button type="primary" size="small" link @click="handleTodoAction(item)">
                    {{ item.actionText }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 所有订单对话框 -->
    <el-dialog
      title="所有订单"
      v-model="allOrdersDialogVisible"
      width="80%"
      destroy-on-close
    >
      <el-table :data="allOrdersTableData" style="width: 100%" v-loading="loadingAllOrders" max-height="500px">
        <el-table-column prop="id" label="订单编号" width="100" sortable></el-table-column>
        <el-table-column prop="customerName" label="客户" width="120" sortable></el-table-column>
        <el-table-column prop="date" label="下单时间" width="180" sortable></el-table-column>
        <el-table-column label="商品信息" width="200">
          <template #default="scope">
            {{ scope.row.itemsDescription }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="金额" sortable>
          <template #default="scope">
            ¥{{ scope.row.total.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" sortable>
          <template #default="scope">
            <el-tag :type="getOrderStatusType(scope.row.status)">
              {{ getOrderStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleViewOrder(scope.row)">
              查看
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              plain 
              @click="handleProcessOrder(scope.row)" 
              v-if="scope.row.status === 'paid' || scope.row.status === '已付款'">
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="empty-data" v-if="allOrdersTableData.length === 0 && !loadingAllOrders">
        <i class="el-icon-document"></i>
        <p>暂无订单数据</p>
  </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="refreshAllOrders">刷新数据</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 已删除商品对话框 -->
    <el-dialog
      title="已删除商品"
      v-model="deletedProductsDialogVisible"
      width="80%"
      destroy-on-close
    >
      <div v-if="deletedProducts.length > 0">
        <el-table :data="deletedProducts" style="width: 100%" max-height="500px">
          <el-table-column prop="id" label="商品ID" width="100"></el-table-column>
          <el-table-column prop="name" label="商品名称"></el-table-column>
          <el-table-column prop="price" label="价格">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存"></el-table-column>
          <el-table-column prop="deletedAt" label="删除时间">
            <template #default="scope">
              {{ formatDate(scope.row.deletedAt, true) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" type="success" plain @click="handleRestoreProduct(scope.row)">
                恢复上架
              </el-button>
              <el-button size="small" type="danger" plain @click="handlePermanentlyDeleteProduct(scope.row)">
                永久删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else class="empty-data">
        <i class="el-icon-delete"></i>
        <p>暂无已删除商品</p>
      </div>
    </el-dialog>
    
    <!-- 店铺信息编辑对话框 -->
    <el-dialog
      title="编辑店铺信息"
      v-model="shopDialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="shopFormRef"
        :model="shopForm"
        :rules="shopFormRules"
        label-width="100px"
        class="shop-form"
      >
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="shopForm.name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        
        <el-form-item label="店铺描述" prop="description">
          <el-input
            type="textarea"
            v-model="shopForm.description"
            :rows="3"
            placeholder="请输入店铺描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="shopForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        
        <el-form-item label="店铺地址" prop="address">
          <el-input v-model="shopForm.address" placeholder="请输入店铺地址"></el-input>
        </el-form-item>
        
        <el-form-item label="店铺分类" prop="category">
          <el-select v-model="shopForm.category" placeholder="请选择店铺分类" style="width: 100%">
            <el-option label="电子产品" value="电子产品"></el-option>
            <el-option label="服装服饰" value="服装服饰"></el-option>
            <el-option label="食品生鲜" value="食品生鲜"></el-option>
            <el-option label="家居日用" value="家居日用"></el-option>
            <el-option label="美妆个护" value="美妆个护"></el-option>
            <el-option label="图书文具" value="图书文具"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="店铺Logo" prop="logo">
          <el-input v-model="shopForm.logo" placeholder="请输入Logo图片URL"></el-input>
          <div class="logo-preview" v-if="shopForm.logo">
            <img :src="shopForm.logo" alt="店铺Logo预览" style="max-width: 100px; max-height: 100px; margin-top: 10px;">
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="shopDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveShopInfo" :loading="savingShop">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SellerDashboard',
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const router = useRouter()
    
    // 用户和店铺信息
    const userInfo = computed(() => userStore.currentUser || {})
    const shopInfo = ref({
      name: '卖家的小店铺',
      description: '专注销售高品质商品',
      createdAt: new Date('2023-01-15').toISOString(),
      phone: '',
      address: '',
      category: '电子产品',
      logo: 'https://picsum.photos/80'
    })
    
    // 判断系统中是否有买家用户
    const hasBuyerUsers = computed(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.some(user => user.role === 'buyer' || !user.role);
    })
    
    // 统计数据
    const productCount = ref(12)
    const orderCount = ref(28)
    const totalSales = ref(5860.50)
    const customerCount = ref(16)
    
    // 最近订单 - 使用订单仓库获取数据
    const recentOrders = computed(() => {
      // 获取所有用户的订单
      const allOrders = getAllOrders();
      
      // 按日期排序并只返回最近5个订单
      return [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          customerName: order.address?.name || '未知客户',
          date: formatDate(order.createdAt, true),
          total: order.total,
          status: order.status,
          items: order.items,
          address: order.address,
          itemsDescription: order.items.length > 1 
            ? `${order.items[0].name} 等${order.items.length}件商品` 
            : order.items[0]?.name || '未知商品'
        }))
    })
    
    // 商品数据
    const products = computed(() => {
      return productsStore.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        inventory: product.stock || 0,
        sales: product.sales || 0
      }))
    })
    
    // 待办事项
    const todoItems = computed(() => {
      // 计算库存不足的商品数量
      const lowStockProducts = productsStore.products.filter(p => p.stock < 10)
      
      // 计算待发货订单数量
      const pendingShipmentOrders = getAllOrders().filter(
        order => order.status === 'paid' || order.status === '已付款'
      )
      
      return [
      {
        type: 'warning',
        icon: 'el-icon-warning',
        title: '库存不足提醒',
          desc: `有${lowStockProducts.length}个商品库存不足10件`,
        actionText: '查看',
        action: 'viewLowInventory'
      },
      {
        type: 'info',
        icon: 'el-icon-s-order',
        title: '待发货订单',
          desc: `有${pendingShipmentOrders.length}个订单等待发货`,
        actionText: '处理',
        action: 'processPendingOrders'
      },
      {
        type: 'success',
        icon: 'el-icon-message',
        title: '新客户留言',
        desc: '有3条新的客户咨询',
        actionText: '回复',
        action: 'replyMessages'
      }
      ]
    })
    
    // 所有订单对话框相关数据
    const allOrdersDialogVisible = ref(false)
    const loadingAllOrders = ref(false)
    const allOrdersTableData = ref([])
    
    // 已删除商品对话框相关数据
    const deletedProductsDialogVisible = ref(false)
    const deletedProducts = ref([])
    
    // 店铺信息编辑对话框相关数据
    const shopDialogVisible = ref(false)
    const shopFormRef = ref(null)
    const shopForm = ref({
      name: '',
      description: '',
      phone: '',
      address: '',
      category: '',
      logo: ''
    })
    const shopFormRules = {
      name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
      description: [{ required: true, message: '请输入店铺描述', trigger: 'blur' }],
      phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
      address: [{ required: true, message: '请输入店铺地址', trigger: 'blur' }],
      category: [{ required: true, message: '请选择店铺分类', trigger: 'change' }],
      logo: [{ required: true, message: '请输入Logo图片URL', trigger: 'blur' }]
    }
    const savingShop = ref(false)
    
    // 初始化
    onMounted(() => {
      // 检查用户是否是卖家
      if (!userInfo.value || userInfo.value.role !== 'seller') {
        ElMessage.warning('您没有访问卖家中心的权限')
        router.push('/')
        return
      }
      
      // 加载数据
      loadDashboardData()
    })
    
    // 加载仪表盘数据
    const loadDashboardData = async () => {
      try {
        // 从localStorage重新加载订单数据
        const storedOrders = JSON.parse(localStorage.getItem('ordersMap') || 'null')
        if (storedOrders) {
          // 手动更新仓库中的数据
          ordersStore.$patch({ ordersMap: storedOrders })
        }
        
        // 初始化商品数据
        await productsStore.fetchProducts()
        
        // 初始化订单数据
        ordersStore.initOrdersData()
        await ordersStore.fetchOrders()
        
        // 初始化用户数据
        // 由于用户数据在登录时已经加载，这里不需要再加载用户数据
        
        // 加载已删除商品数据
        loadDeletedProducts()
        
        // 加载店铺信息
        loadShopInfo()
        
        // 获取所有订单数据
        const allOrders = getAllOrders()
        
        // 更新订单数量统计
        orderCount.value = allOrders.length || 0
        
        // 更新商品数量统计
        productCount.value = productsStore.products.length || 0
        
        // 从localStorage同步总销售额数据
        if (allOrders && allOrders.length > 0) {
          // 获取当前卖家的用户ID
          const sellerId = userInfo.value?.id
          
          // 筛选属于当前卖家的订单
          const sellerOrders = allOrders.filter(order => {
            // 检查订单中的商品是否属于当前卖家
            return order.items && order.items.some(item => {
              const product = productsStore.products.find(p => p.id === item.id)
              return product && product.sellerId === sellerId
            })
          })
          
          // 计算总销售额 - 只计算已付款/已完成的订单
          totalSales.value = sellerOrders.reduce((sum, order) => {
            if (order.status === 'paid' || order.status === 'shipped' || 
                order.status === 'delivered' || order.status === 'completed' ||
                order.status === '已付款' || order.status === '已发货' || 
                order.status === '已送达' || order.status === '已完成') {
              return sum + order.total
            }
            return sum
          }, 0)
          
          // 从localStorage同步客户数量数据
          // 计算独立客户数量 - 只统计下过订单的客户
          const uniqueCustomers = new Set()
          sellerOrders.forEach(order => {
            if (order.address && order.address.name) {
              uniqueCustomers.add(order.address.name)
            } else if (order.userId) {
              uniqueCustomers.add(order.userId)
            }
          })
          customerCount.value = uniqueCustomers.size
          
          // 将数据保存到localStorage以便下次快速加载
          localStorage.setItem(`sellerStats_${sellerId}`, JSON.stringify({
            totalSales: totalSales.value,
            customerCount: customerCount.value,
            lastUpdated: new Date().toISOString()
          }))
        } else {
          // 如果没有订单数据，尝试从localStorage读取缓存的统计数据
          const sellerId = userInfo.value?.id
          const cachedStats = JSON.parse(localStorage.getItem(`sellerStats_${sellerId}`) || 'null')
          
          if (cachedStats) {
            totalSales.value = cachedStats.totalSales || 0
            customerCount.value = cachedStats.customerCount || 0
          } else {
            // 没有缓存数据，重置为0
            totalSales.value = 0
            customerCount.value = 0
          }
        }
        
        console.log('卖家统计数据同步完成:', {
          orderCount: orderCount.value,
          productCount: productCount.value,
          totalSales: totalSales.value,
          customerCount: customerCount.value
        })
        
      } catch (error) {
        console.error('加载仪表盘数据失败:', error)
        ElMessage.error('加载数据失败，请刷新页面重试')
      }
    }
    
    // 获取所有用户的订单
    const getAllOrders = () => {
      const ordersMap = ordersStore.ordersMap || {};
      
      // 使用 Array.prototype.flatMap 来更高效地汇总所有订单
      return Object.values(ordersMap).flatMap(orders => 
        Array.isArray(orders) ? orders : []
      );
    }
    
    // 获取订单状态类型（用于标签颜色）
    const getOrderStatusType = (status) => {
      const statusMap = {
        'pending': 'warning',
        'paid': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'completed': 'success',
        'cancelled': 'danger',
        '待付款': 'warning',
        '已付款': 'info',
        '已发货': 'primary',
        '已送达': 'success',
        '已完成': 'success',
        '已取消': 'danger'
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
      return statusMap[status] || '未知状态'
    }
    
    // 格式化日期
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
    
    // 补零函数
    const padZero = (num) => {
      return num < 10 ? '0' + num : num
    }
    
    // 处理查看订单
    const handleViewOrder = (order) => {
      console.log('查看订单', order)
      // 这里可以实现查看订单详情的逻辑
      ElMessageBox.alert(
        `
        <h3>订单详情</h3>
        <p><strong>订单编号:</strong> ${order.id}</p>
        <p><strong>客户姓名:</strong> ${order.address?.name || '未知'}</p>
        <p><strong>联系电话:</strong> ${order.address?.phone || '未知'}</p>
        <p><strong>收货地址:</strong> ${order.address ? `${order.address.province} ${order.address.city} ${order.address.district} ${order.address.detail}` : '未知'}</p>
        <p><strong>下单时间:</strong> ${order.date}</p>
        <p><strong>订单状态:</strong> ${getOrderStatusText(order.status)}</p>
        <p><strong>订单金额:</strong> ¥${order.total?.toFixed(2) || '0.00'}</p>
        <h4>商品信息:</h4>
        ${order.items?.map(item => `
          <div style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
            <p><strong>${item.name}</strong> × ${item.quantity}</p>
            <p>单价: ¥${item.price?.toFixed(2) || '0.00'}</p>
          </div>
        `).join('') || '无商品信息'}
        `,
        '订单详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }
    
    // 处理处理订单（发货等）
    const handleProcessOrder = (order) => {
      ElMessageBox.confirm(
        `确认为订单 ${order.id} 发货吗？`,
        '发货确认',
        {
          confirmButtonText: '确认发货',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          // 直接在组件中更新订单状态
          // 获取所有订单
          const ordersMap = ordersStore.ordersMap || {};
          let updated = false;
          
          // 遍历所有用户的订单查找目标订单
          for (const userId in ordersMap) {
            if (!Array.isArray(ordersMap[userId])) continue;
            
            const orderIndex = ordersMap[userId].findIndex(o => o.id === order.id);
            if (orderIndex !== -1) {
              // 找到订单并更新状态
              ordersMap[userId][orderIndex].status = '已发货';
              ordersMap[userId][orderIndex].shippedAt = new Date().toISOString();
              updated = true;
              
              // 更新本地存储
              localStorage.setItem('ordersMap', JSON.stringify(ordersMap));
              break;
            }
          }
          
          if (updated) {
            ElMessage.success('订单发货成功');
            
            // 刷新数据
            await loadDashboardData();
          } else {
            throw new Error('找不到要更新的订单');
          }
        } catch (error) {
          console.error('发货失败:', error);
          ElMessage.error('订单处理失败: ' + error);
        }
      }).catch(() => {
        // 用户取消操作，不做任何处理
      });
    }
    
    // 处理添加商品
    const handleAddProduct = () => {
      // 准备表单数据
      const formData = {
        name: '',
        price: '',
        stock: '',
        category: '电子产品', // 默认分类
        description: '',
        imageUrl: '' // 新增图片URL字段
      }
      
      ElMessageBox.prompt(
        `
        <div class="product-form-container">
          <h3>添加新商品</h3>
          <div class="form-group">
            <label>商品名称：</label>
            <input id="product-name" class="el-input__inner" value="${formData.name}">
          </div>
          <div class="form-group">
            <label>价格：</label>
            <div class="input-with-prefix">
              <span class="input-prefix">¥</span>
              <input id="product-price" type="number" class="el-input__inner with-prefix" value="${formData.price}">
            </div>
          </div>
          <div class="form-group">
            <label>库存：</label>
            <input id="product-stock" type="number" class="el-input__inner" value="${formData.stock}">
          </div>
          <div class="form-group">
            <label>分类：</label>
            <select id="product-category" class="el-input__inner">
              <option value="电子产品" ${formData.category === '电子产品' ? 'selected' : ''}>电子产品</option>
              <option value="服饰" ${formData.category === '服饰' ? 'selected' : ''}>服饰</option>
              <option value="图书" ${formData.category === '图书' ? 'selected' : ''}>图书</option>
            </select>
          </div>
          <div class="form-group">
            <label>商品图片URL：</label>
            <input id="product-image" class="el-input__inner" placeholder="请输入商品图片链接" value="${formData.imageUrl}">
          </div>
          <div class="form-group">
            <label>描述：</label>
            <textarea id="product-description" class="el-textarea__inner">${formData.description}</textarea>
          </div>
        </div>
        `,
        '添加商品',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          inputValue: formData.name,
          inputValidator: () => true, // 禁用默认验证
          closeOnClickModal: false,
          closeOnPressEscape: false,
          customClass: 'product-form-dialog'
        }
      ).then(() => {
        // 获取表单值
        const productData = {
          name: document.getElementById('product-name').value,
          price: document.getElementById('product-price').value,
          stock: document.getElementById('product-stock').value,
          category: document.getElementById('product-category').value,
          description: document.getElementById('product-description').value,
          imageUrl: document.getElementById('product-image').value // 获取图片URL
        }
        
        // 验证表单
        if (!productData.name) {
          ElMessage.error('商品名称不能为空')
          return
        }
        
        if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
          ElMessage.error('请输入有效的价格')
          return
        }
        
        if (!productData.stock || isNaN(parseInt(productData.stock)) || parseInt(productData.stock) < 0) {
          ElMessage.error('请输入有效的库存数量')
          return
        }
        
        // 处理图片
        let images = [];
        if (productData.imageUrl) {
          images.push(productData.imageUrl);
        } else {
          // 根据分类设置默认图片
          if (productData.category === '电子产品') {
            images.push(require('@/assets/images/耳机.jpeg'));
          } else if (productData.category === '服饰') {
            images.push(require('@/assets/images/clothes.jpg'));
          } else if (productData.category === '图书') {
            images.push(require('@/assets/images/book.jpg'));
          }
        }
        
        // 添加图片数组到商品数据
        productData.images = images;
        
        // 添加商品
        const newProduct = productsStore.addProduct(productData)
        if (newProduct) {
          ElMessage.success('商品添加成功')
        } else {
          ElMessage.error('添加商品失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 处理编辑商品
    const handleEditProduct = (product) => {
      // 获取原始图片URL
      const originalImageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : '';
      
      // 准备表单数据
      const formData = {
        name: product.name,
        price: product.price,
        stock: product.inventory,
        category: product.category || '电子产品',
        description: product.description || '',
        imageUrl: originalImageUrl
      }
      
      ElMessageBox.prompt(
        `
        <div class="product-form-container">
          <h3>编辑商品</h3>
          <div class="form-group">
            <label>商品名称：</label>
            <input id="product-name" class="el-input__inner" value="${formData.name}">
          </div>
          <div class="form-group">
            <label>价格：</label>
            <div class="input-with-prefix">
              <span class="input-prefix">¥</span>
              <input id="product-price" type="number" class="el-input__inner with-prefix" value="${formData.price}">
            </div>
          </div>
          <div class="form-group">
            <label>库存：</label>
            <input id="product-stock" type="number" class="el-input__inner" value="${formData.stock}">
          </div>
          <div class="form-group">
            <label>分类：</label>
            <select id="product-category" class="el-input__inner">
              <option value="电子产品" ${formData.category === '电子产品' ? 'selected' : ''}>电子产品</option>
              <option value="服饰" ${formData.category === '服饰' ? 'selected' : ''}>服饰</option>
              <option value="图书" ${formData.category === '图书' ? 'selected' : ''}>图书</option>
            </select>
          </div>
          <div class="form-group">
            <label>商品图片URL：</label>
            <input id="product-image" class="el-input__inner" placeholder="请输入商品图片链接" value="${formData.imageUrl}">
          </div>
          <div class="form-group">
            <label>描述：</label>
            <textarea id="product-description" class="el-textarea__inner">${formData.description}</textarea>
          </div>
        </div>
        `,
        '编辑商品',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          inputValue: formData.name,
          inputValidator: () => true, // 禁用默认验证
          closeOnClickModal: false,
          closeOnPressEscape: false,
          customClass: 'product-form-dialog'
        }
      ).then(() => {
        // 获取表单值
        const updateData = {
          name: document.getElementById('product-name').value,
          price: document.getElementById('product-price').value,
          stock: document.getElementById('product-stock').value,
          category: document.getElementById('product-category').value,
          description: document.getElementById('product-description').value,
          imageUrl: document.getElementById('product-image').value
        }
        
        // 验证表单
        if (!updateData.name) {
          ElMessage.error('商品名称不能为空')
          return
        }
        
        if (!updateData.price || isNaN(parseFloat(updateData.price)) || parseFloat(updateData.price) <= 0) {
          ElMessage.error('请输入有效的价格')
          return
        }
        
        if (!updateData.stock || isNaN(parseInt(updateData.stock)) || parseInt(updateData.stock) < 0) {
          ElMessage.error('请输入有效的库存数量')
          return
        }
        
        // 处理图片
        let images = [];
        if (updateData.imageUrl) {
          images.push(updateData.imageUrl);
        } else {
          // 根据分类设置默认图片
          if (updateData.category === '电子产品') {
            images.push(require('@/assets/images/耳机.jpeg'));
          } else if (updateData.category === '服饰') {
            images.push(require('@/assets/images/clothes.jpg'));
          } else if (updateData.category === '图书') {
            images.push(require('@/assets/images/book.jpg'));
          }
        }
        
        // 添加图片数组到更新数据
        updateData.images = images;
        
        // 更新商品
        const updatedProduct = productsStore.updateProduct(product.id, updateData)
        if (updatedProduct) {
          ElMessage.success('商品更新成功')
        } else {
          ElMessage.error('更新商品失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 处理删除商品
    const handleDeleteProduct = (product) => {
      ElMessageBox.confirm(
        `确认删除商品"${product.name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 删除商品
        const result = productsStore.deleteProduct(product.id)
        if (result) {
        ElMessage.success('商品删除成功')
          
          // 打印日志以便调试
          console.log('删除的商品ID:', product.id)
          console.log('当前商品列表:', productsStore.products.map(p => ({ id: p.id, name: p.name })))
          console.log('已删除商品列表:', productsStore.deletedProducts.map(p => ({ id: p.id, name: p.name })))
          
          // 加载已删除商品数据
          loadDeletedProducts()
        } else {
          ElMessage.error('删除商品失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 处理编辑店铺
    const handleEditShop = () => {
      // 将当前店铺信息加载到表单
      shopForm.value = {
        name: shopInfo.value.name || '',
        description: shopInfo.value.description || '',
        phone: shopInfo.value.phone || '',
        address: shopInfo.value.address || '',
        category: shopInfo.value.category || '电子产品',
        logo: shopInfo.value.logo || ''
      }
      
      // 显示编辑对话框
      shopDialogVisible.value = true
    }
    
    // 处理待办事项
    const handleTodoAction = (item) => {
      console.log('处理待办', item)
      
      if (item.action === 'viewLowInventory') {
        // 显示库存不足的商品
        ElMessageBox.alert(
          `
          <h3>库存不足商品列表</h3>
          <div style="max-height: 300px; overflow-y: auto;">
            ${productsStore.products.filter(p => p.stock < 10).map(p => `
              <div style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                <p><strong>${p.name}</strong></p>
                <p>ID: ${p.id}</p>
                <p>当前库存: <span style="color: red; font-weight: bold;">${p.stock}</span></p>
              </div>
            `).join('') || '暂无库存不足商品'}
          </div>
          `,
          '库存不足提醒',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          }
        )
      } else if (item.action === 'processPendingOrders') {
        // 显示待发货订单
        showAllOrders()
        // 可以在这里添加过滤功能，让订单表格只显示待发货订单
      } else if (item.action === 'replyMessages') {
        ElMessage.info('客户留言功能尚未实现')
      }
    }
    
    // 处理返回首页
    const goToHome = () => {
      router.push('/')
    }
    
    // 显示所有订单对话框
    const showAllOrders = () => {
      allOrdersDialogVisible.value = true
      loadAllOrders()
    }
    
    // 加载所有订单数据
    const loadAllOrders = () => {
      loadingAllOrders.value = true
      
      try {
        // 获取所有用户的订单
        const allOrders = getAllOrders();
        
        // 转换订单格式，按日期排序
        allOrdersTableData.value = [...allOrders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(order => ({
            id: order.id,
            customerName: order.address?.name || '未知客户',
            date: formatDate(order.createdAt, true),
            total: order.total,
            status: order.status,
            items: order.items,
            address: order.address,
            itemsDescription: order.items.length > 1 
              ? `${order.items[0].name} 等${order.items.length}件商品` 
              : order.items[0]?.name || '未知商品'
          }))
      } catch (error) {
        console.error('加载所有订单失败:', error)
        ElMessage.error('加载订单数据失败')
      } finally {
        loadingAllOrders.value = false
      }
    }
    
    // 刷新所有订单数据
    const refreshAllOrders = async () => {
      await loadDashboardData()
      loadAllOrders()
      ElMessage.success('订单数据已刷新')
    }
    
    // 刷新统计数据
    const refreshStatistics = async () => {
      try {
        // 清除缓存的统计数据
        const sellerId = userInfo.value?.id
        if (sellerId) {
          localStorage.removeItem(`sellerStats_${sellerId}`)
        }
        
        // 重新加载数据
        await loadDashboardData()
        ElMessage.success('统计数据已更新')
      } catch (error) {
        console.error('刷新统计数据失败:', error)
        ElMessage.error('刷新统计数据失败')
      }
    }
    
    // 处理显示已删除商品对话框
    const showDeletedProducts = () => {
      deletedProductsDialogVisible.value = true
      loadDeletedProducts()
    }
    
    // 加载已删除商品数据
    const loadDeletedProducts = () => {
      deletedProducts.value = productsStore.deletedProducts
    }
    
    // 处理恢复商品上架
    const handleRestoreProduct = (product) => {
      ElMessageBox.confirm(
        `确认将商品"${product.name}"恢复上架吗？`,
        '恢复确认',
        {
          confirmButtonText: '确认恢复',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        // 调用Store中的恢复方法
        const result = productsStore.restoreProduct(product.id)
        if (result) {
          ElMessage.success('商品已成功恢复上架')
          // 刷新已删除商品列表
          loadDeletedProducts()
        } else {
          ElMessage.error('恢复商品失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 处理永久删除商品
    const handlePermanentlyDeleteProduct = (product) => {
      ElMessageBox.confirm(
        `确认永久删除商品"${product.name}"吗？此操作不可恢复！`,
        '永久删除确认',
        {
          confirmButtonText: '永久删除',
          cancelButtonText: '取消',
          type: 'error'
        }
      ).then(() => {
        // 调用Store中的永久删除方法
        const result = productsStore.permanentlyDeleteProduct(product.id)
        if (result) {
          ElMessage.success('商品已永久删除')
          // 刷新已删除商品列表
          loadDeletedProducts()
        } else {
          ElMessage.error('永久删除商品失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 处理保存店铺信息
    const saveShopInfo = async () => {
      if (!shopFormRef.value) return
      
      try {
        // 表单验证
        await shopFormRef.value.validate()
        
        savingShop.value = true
        
        // 确认保存
        await ElMessageBox.confirm('确认保存店铺信息吗？', '保存确认', {
          confirmButtonText: '确认保存',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 更新店铺信息
        shopInfo.value = {
          ...shopInfo.value,
          ...shopForm.value,
          updatedAt: new Date().toISOString()
        }
        
        // 获取当前卖家ID
        const sellerId = userInfo.value?.id
        
        // 保存店铺信息到localStorage
        if (sellerId) {
          // 保存特定卖家的店铺信息
          localStorage.setItem(`shopInfo_${sellerId}`, JSON.stringify(shopInfo.value))
          
          // 同时更新通用店铺信息
          localStorage.setItem('shopInfo', JSON.stringify(shopInfo.value))
          
          // 更新商店列表
          updateShopInList(sellerId, shopInfo.value)
        } else {
          // 仅保存通用店铺信息
          localStorage.setItem('shopInfo', JSON.stringify(shopInfo.value))
        }
        
        ElMessage.success('店铺信息保存成功')
        shopDialogVisible.value = false
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return
        }
        console.error('保存店铺信息失败:', error)
        ElMessage.error('保存店铺信息失败: ' + (error.message || '未知错误'))
      } finally {
        savingShop.value = false
      }
    }
    
    // 更新商店列表中的店铺信息
    const updateShopInList = (sellerId, shopData) => {
      try {
        // 获取商店列表
        const shops = JSON.parse(localStorage.getItem('shops') || '[]')
        
        // 查找当前卖家的店铺
        const shopIndex = shops.findIndex(shop => 
          shop.ownerId === sellerId || 
          shop.ownerUsername === userInfo.value?.username
        )
        
        if (shopIndex !== -1) {
          // 更新已存在的店铺
          shops[shopIndex] = {
            ...shops[shopIndex],
            name: shopData.name,
            description: shopData.description,
            category: shopData.category,
            logo: shopData.logo,
            phone: shopData.phone,
            address: shopData.address,
            updatedAt: new Date().toISOString()
          }
        } else {
          // 创建新店铺
          shops.push({
            id: `shop_${Date.now()}`,
            ownerId: sellerId,
            ownerUsername: userInfo.value?.username,
            name: shopData.name,
            description: shopData.description,
            category: shopData.category,
            logo: shopData.logo,
            phone: shopData.phone,
            address: shopData.address,
            createdAt: shopData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
          })
        }
        
        // 保存更新后的商店列表
        localStorage.setItem('shops', JSON.stringify(shops))
      } catch (error) {
        console.error('更新商店列表失败:', error)
      }
    }
    
    // 加载店铺信息
    const loadShopInfo = () => {
      try {
        // 获取当前卖家ID
        const sellerId = userInfo.value?.id
        
        // 优先尝试加载特定卖家的店铺信息
        if (sellerId) {
          const sellerShopInfo = JSON.parse(localStorage.getItem(`shopInfo_${sellerId}`) || 'null')
          if (sellerShopInfo) {
            shopInfo.value = {
              ...shopInfo.value,
              ...sellerShopInfo
            }
            return
          }
        }
        
        // 如果没有特定卖家的店铺信息，尝试从通用店铺信息加载
        const generalShopInfo = JSON.parse(localStorage.getItem('shopInfo') || 'null')
        if (generalShopInfo) {
          shopInfo.value = {
            ...shopInfo.value,
            ...generalShopInfo
          }
          return
        }
        
        // 如果都没有，尝试从商店列表中查找
        if (sellerId || userInfo.value?.username) {
          const shops = JSON.parse(localStorage.getItem('shops') || '[]')
          const userShop = shops.find(shop => 
            shop.ownerId === sellerId || 
            shop.ownerUsername === userInfo.value?.username
          )
          
          if (userShop) {
            shopInfo.value = {
              ...shopInfo.value,
              name: userShop.name || shopInfo.value.name,
              description: userShop.description || shopInfo.value.description,
              category: userShop.category || shopInfo.value.category,
              logo: userShop.logo || shopInfo.value.logo,
              phone: userShop.phone || shopInfo.value.phone,
              address: userShop.address || shopInfo.value.address,
              createdAt: userShop.createdAt || shopInfo.value.createdAt
            }
          }
        }
      } catch (error) {
        console.error('加载店铺信息失败:', error)
      }
    }
    
    return {
      userInfo,
      shopInfo,
      productCount,
      orderCount,
      totalSales,
      customerCount,
      recentOrders,
      products,
      todoItems,
      getOrderStatusType,
      getOrderStatusText,
      formatDate,
      handleViewOrder,
      handleProcessOrder,
      handleAddProduct,
      handleEditProduct,
      handleDeleteProduct,
      handleEditShop,
      handleTodoAction,
      goToHome,
      hasBuyerUsers,
      // 所有订单对话框
      allOrdersDialogVisible,
      allOrdersTableData,
      loadingAllOrders,
      showAllOrders,
      refreshAllOrders,
      refreshStatistics,
      // 已删除商品对话框
      deletedProductsDialogVisible,
      deletedProducts,
      showDeletedProducts,
      loadDeletedProducts,
      handleRestoreProduct,
      handlePermanentlyDeleteProduct,
      // 店铺信息编辑对话框
      shopDialogVisible,
      shopForm,
      shopFormRef,
      shopFormRules,
      savingShop,
      saveShopInfo,
      updateShopInList
    }
  }
}
</script>

<style scoped>
.seller-dashboard {
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
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
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
  color: var(--gray-800);
  font-size: 18px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 10px;
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

.shop-info {
  display: flex;
  align-items: flex-start;
  padding: 5px;
}

.shop-logo {
  margin-right: 20px;
}

.shop-logo img {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border: 2px solid #f0f0f0;
}

.shop-details {
  flex: 1;
}

.shop-details h4 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--gray-800);
  font-weight: 600;
}

.shop-details p {
  color: var(--gray-600);
  margin: 0 0 15px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 90%;
}

.shop-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-row {
  display: flex;
  gap: 20px;
}

.data-item {
  flex: 1;
  margin-bottom: 0;
}

.data-item.full-width {
  flex: 2;
  width: 100%;
}

.data-label {
  font-size: 12px;
  color: var(--gray-600);
  margin-bottom: 5px;
}

.data-value {
  font-size: 14px;
  color: var(--gray-800);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.todo-icon.warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.todo-icon.info {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.todo-icon.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.todo-icon.danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.todo-icon i {
  font-size: 20px;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: 3px;
}

.todo-desc {
  font-size: 13px;
  color: var(--gray-600);
}

.role-select {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

/* 订单对话框相关样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 使用兼容性更好的深度选择器语法 */
:deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* 商品表单对话框样式 */
:global(.product-form-dialog .el-message-box__content) {
  padding: 10px 15px;
}

:global(.product-form-dialog .el-message-box__input) {
  display: none;
}

:global(.product-form-dialog .el-message-box__message p) {
  margin: 0;
}

:global(.product-form-dialog .el-message-box) {
  min-width: 500px;
  max-width: 80%;
}

/* 新增样式 - 美化商品表单 */
:global(.product-form-dialog .el-input__inner) {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

:global(.product-form-dialog .el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:global(.product-form-dialog .el-textarea__inner) {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

:global(.product-form-dialog .el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:global(.product-form-dialog h3) {
  font-size: 20px;
  color: var(--primary-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--primary-light);
}

:global(.product-form-dialog label) {
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px !important;
}

:global(.product-form-dialog .el-message-box__header) {
  padding: 15px 20px;
}

:global(.product-form-dialog .el-message-box__title) {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-800);
}

:global(.product-form-dialog .el-message-box__headerbtn) {
  font-size: 20px;
  top: 15px;
  right: 20px;
}

:global(.product-form-dialog .el-message-box__btns) {
  padding: 10px 20px 20px;
}

/* 新增样式 - 商品表单容器和表单元素 */
:global(.product-form-container) {
  text-align: left;
  margin-bottom: 15px;
}

:global(.product-form-container h3) {
  margin-bottom: 20px;
  font-size: 20px;
  color: var(--primary-color);
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-light);
}

:global(.form-group) {
  margin-bottom: 16px;
}

:global(.form-group label) {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--gray-700);
}

:global(.input-with-prefix) {
  position: relative;
  display: flex;
  align-items: center;
}

:global(.input-prefix) {
  position: absolute;
  left: 12px;
  color: #606266;
  font-weight: 600;
  z-index: 1;
}

:global(.with-prefix) {
  padding-left: 28px !important;
}

:global(.el-input__inner) {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

:global(.el-textarea__inner) {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  resize: vertical;
}
</style> 