<template>
  <div class="product-detail-page">
    <Header />
    
    <div class="main-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="product" class="product-detail">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">全部商品</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/products?category=${product.category}` }">{{ product.category }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <el-row :gutter="30" class="product-content">
          <!-- 商品图片 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" class="product-images">
            <el-carousel v-if="product && product.images && product.images.length" trigger="click" height="400px" indicator-position="outside">
              <el-carousel-item v-for="(image, index) in product.images" :key="index">
                <img :src="image" class="product-image" />
              </el-carousel-item>
            </el-carousel>
          </el-col>
          
          <!-- 商品信息 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" class="product-info">
            <h1 class="product-name">{{ product.name }}</h1>
            
            <div class="product-meta">
              <div class="product-price">¥{{ product.price }}</div>
              <div class="product-stock">库存: {{ product.stock }}</div>
            </div>
            
            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>
            
            <div class="product-quantity">
              <span class="quantity-label">数量:</span>
              <el-input-number v-model="quantity" :min="1" :max="product.stock" controls-position="right"></el-input-number>
            </div>
            
            <div class="product-actions">
              <el-button type="primary" size="large" icon="el-icon-shopping-cart-2" @click="addToCart" :disabled="product.stock <= 0">
                加入购物车
              </el-button>
              <el-button type="danger" size="large" icon="el-icon-shopping-bag-2" @click="buyNow" :disabled="product.stock <= 0">
                立即购买
              </el-button>
            </div>
            
            <div class="product-notice" v-if="product.stock <= 0">
              <el-alert title="该商品已售罄" type="warning" show-icon />
            </div>
          </el-col>
        </el-row>
        
        <!-- 商品详情 -->
        <div class="product-more-info">
          <el-tabs type="border-card">
            <el-tab-pane label="商品详情">
              <div class="detail-content">
                <h3>规格参数</h3>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="商品编号">{{ product.id }}</el-descriptions-item>
                  <el-descriptions-item label="商品类别">{{ product.category }}</el-descriptions-item>
                  <el-descriptions-item label="库存数量">{{ product.stock }}</el-descriptions-item>
                </el-descriptions>
                
                <h3>商品详情</h3>
                <div class="detail-text">
                  <p>{{ product.description }}</p>
                  <p>{{ product.description }}</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="用户评价">
              <div class="review-content">
                <el-empty description="暂无评价" :image-size="200"></el-empty>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <div v-else class="product-not-found">
        <el-result icon="error" title="商品不存在" sub-title="您查询的商品不存在或已下架">
          <template #extra>
            <el-button type="primary" @click="$router.push('/products')">返回商品列表</el-button>
          </template>
        </el-result>
      </div>
    </div>
    
    <!-- 页脚 -->
    <div class="footer">
      <p>© 2025 东软网上商城 - 基于Vue.js的购物网站实验项目</p>
      <p>广东东软学院Web前端开发技术课程</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'

export default {
  name: 'ProductDetail',
  components: {
    Header
  },
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const route = useRoute()
    const router = useRouter()
    
    // 加载状态
    const loading = ref(true)
    
    // 商品数据
    const product = ref(null)
    
    // 购买数量
    const quantity = ref(1)
    
    // 获取商品数据
    onMounted(async () => {
      loading.value = true
      try {
        // 获取商品ID
        const productId = route.params.id
        // 先加载所有商品
        if (!productsStore.products || productsStore.products.length === 0) {
          await productsStore.fetchProducts()
        }
        // 查找指定商品
        const foundProduct = productsStore.getProductById(productId)
        if (foundProduct && foundProduct.images && foundProduct.images.length) {
          product.value = foundProduct
        } else if (foundProduct) {
          // 没有图片也允许展示
          product.value = { ...foundProduct, images: [] }
        } else {
          ElMessage.error('商品不存在或已下架')
        }
      } catch (error) {
        ElMessage.error('获取商品信息失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    })
    
    // 添加到购物车
    const addToCart = () => {
      // 检查库存是否足够
      if (!product.value || product.value.stock < quantity.value) {
        ElMessage.error(`商品库存不足，当前库存: ${product.value?.stock || 0}`);
        return false;
      }
      
      // 构建带有数量的商品对象
      const cartItem = {
        ...product.value,
        quantity: quantity.value
      }
      
      // 添加到购物车
      const result = cartStore.addItem(cartItem);
      
      if (result) {
        ElMessage.success(`已将 ${quantity.value} 件 ${product.value.name} 加入购物车`);
        return true;
      } else {
        // 添加失败可能是库存不足或未登录
        if (!userStore.isLoggedIn) {
          ElMessage.warning('请先登录后再添加商品到购物车');
        } else {
          ElMessage.warning('添加商品失败，可能是购物车已达到最大库存限制');
        }
        return false;
      }
    }
    
    // 立即购买
    const buyNow = () => {
      // 检查库存是否足够
      if (!product.value || product.value.stock < quantity.value) {
        ElMessage.error(`商品库存不足，当前库存: ${product.value?.stock || 0}`);
        return;
      }
      
      // 先加入购物车
      addToCart()
      
      // 跳转到结算页
      router.push('/checkout')
    }
    
    return {
      loading,
      product,
      quantity,
      addToCart,
      buyNow
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  width: 100%;
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container, .product-not-found {
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-content {
  margin-bottom: 40px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 24px;
  margin-bottom: 20px;
}

.product-meta {
  margin-bottom: 20px;
}

.product-price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-stock {
  color: #909399;
  font-size: 14px;
}

.product-description {
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px dashed #ebeef5;
  border-bottom: 1px dashed #ebeef5;
}

.product-quantity {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.quantity-label {
  margin-right: 10px;
  font-weight: bold;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.product-notice {
  margin-top: 15px;
}

.product-more-info {
  margin-top: 40px;
}

.detail-content, .review-content {
  padding: 20px;
}

.detail-content h3 {
  margin-top: 20px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.detail-text {
  line-height: 1.8;
}

.footer {
  background-color: #303133;
  color: #fff;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .product-name {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 24px;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .product-actions .el-button {
    width: 100%;
  }
}
</style> 