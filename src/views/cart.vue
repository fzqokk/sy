<template>
  <div class="cart-page">
    <Header />
    
    <div class="main-content">
      <h1 class="page-title">我的购物车</h1>
      
      <!-- 未登录状态显示 -->
      <div v-if="!isLoggedIn" class="login-required">
        <el-empty description="请先登录后查看购物车" :image-size="200">
          <template #extra>
            <el-button type="primary" @click="showLoginDialog">立即登录</el-button>
            <el-button @click="$router.push('/products')">去购物</el-button>
          </template>
        </el-empty>
      </div>
      
      <div v-else-if="cartItems.length > 0" class="cart-content shadow-hover">
        <el-table :data="cartItems" style="width: 100%" border :height="400" :resize-observer="false">
          <el-table-column align="center" width="70">
            <template #default="scope">
              <el-checkbox v-model="scope.row.selected" @change="updateSelection"></el-checkbox>
            </template>
          </el-table-column>
          
          <el-table-column label="商品信息" min-width="400">
            <template #default="scope">
              <div class="product-info">
                <div class="product-image img-hover-zoom">
                  <img :src="scope.row.images[0]" @click="goToProduct(scope.row.id)" v-img-fallback />
                </div>
                <div class="product-name" @click="goToProduct(scope.row.id)">
                  {{ scope.row.name }}
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="单价" width="120" align="center">
            <template #default="scope">
              <div class="product-price">¥{{ scope.row.price }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="数量" width="150" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                :max="scope.row.stock"
                size="small"
                @change="(value) => updateQuantity(scope.row.id, value)">
              </el-input-number>
            </template>
          </el-table-column>
          
          <el-table-column label="小计" width="120" align="center">
            <template #default="scope">
              <div class="product-subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="danger" size="small" plain class="ripple-btn" @click="removeFromCart(scope.row.id)">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="cart-footer">
          <div class="cart-select-all">
            <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
            <el-button link class="clear-btn ripple-btn" @click="clearCart">
              <i class="el-icon-delete"></i> 清空购物车
            </el-button>
          </div>
          
          <div class="cart-total">
            <div class="total-info">
              <div class="selected-count">已选商品 <span>{{ selectedCount }}</span> 件</div>
              <div class="total-price">合计: <span>¥{{ totalPrice.toFixed(2) }}</span></div>
            </div>
            <el-button type="danger" size="large" class="checkout-btn btn-animated" @click="checkout" :disabled="selectedCount === 0">
              去结算 <i class="el-icon-right"></i>
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-else class="cart-empty shadow-hover">
        <el-empty description="购物车空空如也，去挑选心仪的商品吧~" :image-size="200">
          <template #extra>
            <el-button type="primary" class="btn-animated" @click="$router.push('/products')">
              <i class="el-icon-shopping-bag-1"></i> 去购物
            </el-button>
          </template>
        </el-empty>
      </div>
    </div>
    
    <!-- 页脚 -->
    <div class="footer">
      <p>网上商城 - 基于Vue.js的购物网站实验项目</p>
      <p>Web前端开发技术课程</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Header from '@/components/Header.vue'

export default {
  name: 'CartView',
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
    
    // 购物车商品数据
    const cartItems = ref([])
    
    // 全选状态
    const selectAll = ref(false)
    
    // 初始化购物车
    onMounted(() => {
      if (!isLoggedIn.value) return;
      
      try {
        // 获取购物车数据
        const items = (cartStore.items || []).map(item => ({
          ...item,
          selected: true  // 默认全选
        }));
        
        cartItems.value = items;
        updateSelection();
      } catch (error) {
        console.error('初始化购物车失败:', error);
        cartItems.value = [];
      }
    })
    
    // 已选商品数量
    const selectedCount = computed(() => {
      return cartItems.value.filter(item => item.selected).length
    })
    
    // 计算总价
    const totalPrice = computed(() => {
      return cartItems.value.reduce((total, item) => {
        return item.selected ? total + (item.price * item.quantity) : total
      }, 0)
    })
    
    // 监听全选状态
    watch(cartItems, () => {
      selectAll.value = cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
    }, { deep: true })
    
    // 切换全选状态
    const toggleSelectAll = (val) => {
      cartItems.value.forEach(item => {
        item.selected = val
      })
      updateSelection()
    }
    
    // 更新商品选中状态
    const updateSelection = () => {
      selectAll.value = cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
    }
    
    // 更新商品数量
    const updateQuantity = (id, quantity) => {
      // 获取商品的当前库存
      const product = productsStore.getProductById(id);
      const maxStock = product ? product.stock : undefined;
      
      // 调用cartStore更新数量，并传递库存限制
      cartStore.updateQuantity({
        productId: id,
        quantity: quantity,
        maxStock: maxStock
      });
      
      // 如果数量超过库存，显示警告
      if (maxStock !== undefined && quantity > maxStock) {
        ElMessage.warning(`商品库存不足，已将数量调整为最大可购买数量: ${maxStock}`);
      }
    }
    
    // 从购物车中移除商品
    const removeFromCart = (id) => {
      ElMessageBox.confirm('确定要从购物车中移除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cartStore.removeItem(id)
        cartItems.value = cartItems.value.filter(item => item.id !== id)
        ElMessage.success('商品已从购物车中移除')
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 清空购物车
    const clearCart = () => {
      if (cartItems.value.length === 0) return
      
      ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cartStore.clearCart()
        cartItems.value = []
        ElMessage.success('购物车已清空')
      }).catch(() => {
        // 取消操作
      })
    }
    
    // 跳转到商品详情
    const goToProduct = (id) => {
      router.push(`/product/${id}`)
    }
    
    // 前往结算
    const checkout = () => {
      // 将选中的商品信息传递到结算页
      const selectedItems = cartItems.value.filter(item => item.selected)
      
      if (selectedItems.length === 0) {
        ElMessage.warning('请至少选择一件商品')
        return
      }
      
      // 将选中的商品存储到本地，以便结算页使用
      localStorage.setItem('checkoutItems', JSON.stringify(selectedItems))
      
      // 跳转到结算页
      router.push('/checkout')
    }
    
    // 显示登录对话框
    const showLoginDialog = () => {
      /* 已移除全局登录状态控制 */
    }
    
    return {
      isLoggedIn,
      cartItems,
      selectAll,
      selectedCount,
      totalPrice,
      toggleSelectAll,
      updateSelection,
      updateQuantity,
      removeFromCart,
      clearCart,
      goToProduct,
      checkout,
      showLoginDialog
    }
  }
}
</script>

<style scoped>
.cart-page {
  width: 100%;
}

.main-content {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

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

.cart-content {
  background-color: #fff;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.cart-content:hover {
  box-shadow: var(--shadow-md);
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  overflow: hidden;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.product-image:hover img {
  transform: scale(1.1);
}

.product-name {
  font-size: 14px;
  cursor: pointer;
  transition: color var(--transition-fast);
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-name:hover {
  color: var(--primary-color);
}

.product-price {
  color: var(--gray-700);
  font-weight: 500;
}

.product-subtotal {
  color: var(--secondary-color);
  font-weight: bold;
  font-size: 16px;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background-color: #f8f9fa;
  border: 1px solid #ebeef5;
  border-top: none;
}

.cart-select-all {
  display: flex;
  align-items: center;
}

.clear-btn {
  margin-left: 20px;
  color: var(--gray-600);
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--danger-color);
}

.clear-btn i {
  margin-right: 5px;
}

.cart-total {
  display: flex;
  align-items: center;
}

.total-info {
  margin-right: 30px;
  text-align: right;
}

.selected-count {
  font-size: 14px;
  color: var(--gray-700);
  margin-bottom: 5px;
}

.selected-count span {
  font-weight: bold;
  color: var(--primary-color);
}

.total-price {
  font-size: 16px;
  color: var(--gray-700);
}

.total-price span {
  font-size: 24px;
  font-weight: bold;
  color: var(--secondary-color);
}

.checkout-btn {
  padding: 12px 25px;
  border-radius: 8px;
}

.checkout-btn i {
  margin-left: 5px;
  transition: transform var(--transition-fast);
}

.checkout-btn:hover i {
  transform: translateX(3px);
}

.cart-empty {
  padding: 60px 0;
  background-color: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.cart-empty:hover {
  box-shadow: var(--shadow-md);
}

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

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  color: var(--gray-700);
  transition: all var(--transition-fast);
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: var(--primary-color);
  background-color: #f0f5ff;
}

:deep(.el-table th) {
  background-color: #f8faff !important;
  color: var(--gray-700);
  font-weight: 600;
}

:deep(.el-table--border, .el-table--group) {
  border-radius: var(--border-radius) !important;
  overflow: hidden;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .page-title {
    font-size: 26px;
    margin-bottom: 20px;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 20px;
    padding: 15px;
  }
  
  .cart-total {
    width: 100%;
    justify-content: space-between;
  }
  
  .total-info {
    margin-right: 0;
  }
  
  .checkout-btn {
    padding: 10px 20px;
  }
  
  .product-name {
    max-width: 150px;
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