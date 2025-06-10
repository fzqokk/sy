<template>
  <el-card :body-style="{ padding: '0px' }" class="product-card shine-effect" shadow="hover">
    <div class="image-container img-hover-zoom" @click="goToDetail">
      <img :src="product.images[0]" class="product-image" v-img-fallback />
      <div class="product-overlay">
        <span class="view-details">查看详情</span>
      </div>
      <div class="product-badge" v-if="isNew">新品</div>
      <div class="product-badge sold-out" v-if="product.stock <= 0">售罄</div>
    </div>
    <div class="product-info">
      <div class="product-name" @click="goToDetail">{{ product.name }}</div>
      <div class="product-price">¥{{ product.price }}</div>
      <div class="product-stock" :class="{'low-stock': product.stock < 10}">
        库存: {{ product.stock }}
        <span v-if="product.stock < 10" class="stock-warning">库存紧张</span>
      </div>
      <div class="product-actions">
        <el-button type="primary" size="small" class="btn-animated ripple-btn" @click="addToCart" :disabled="product.stock <= 0">
          <i class="el-icon-shopping-cart-2"></i> 加入购物车
        </el-button>
        <el-button size="small" class="ripple-btn" @click="goToDetail">
          <i class="el-icon-view"></i> 查看详情
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { useProductsStore } from '@/stores/productsStore'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const router = useRouter()
    
    // 判断是否为新品（示例逻辑，可以根据实际需求修改）
    const isNew = computed(() => {
      // 模拟新品判断逻辑，比如后三个商品为新品
      const allProducts = productsStore.products || [];
      if (Array.isArray(allProducts)) {
        const lastThreeIds = allProducts.slice(-3).map(p => p.id);
        return lastThreeIds.includes(props.product.id);
      }
      return false;
    });
    
    const goToDetail = () => {
      router.push(`/product/${props.product.id}`)
    }
    
    const addToCart = () => {
      // 检查库存
      if (props.product.stock <= 0) {
        ElMessage.warning('商品库存不足')
        return
      }
      
      // 创建带有1件数量的商品对象
      const cartItem = {
        ...props.product,
        quantity: 1
      }
      
      // 添加到购物车
      cartStore.addItem(cartItem)
      
      ElMessage.success(`已将 ${props.product.name} 加入购物车`)
    }
    
    return {
      goToDetail,
      addToCart,
      isNew
    }
  }
}
</script>

<style scoped>
.product-card {
  width: 100%;
  margin-bottom: 20px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  border: none;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-md);
}

.image-container {
  height: 240px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.image-container:hover .product-image {
  transform: scale(1.08);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-normal);
}

.image-container:hover .product-overlay {
  opacity: 1;
}

.view-details {
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: 500;
  letter-spacing: 1px;
  transform: translateY(20px);
  transition: transform var(--transition-normal), background 0.2s;
}

.image-container:hover .view-details {
  transform: translateY(0);
}

.view-details:hover {
  background: rgba(0, 0, 0, 0.9);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--secondary-color);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-badge.sold-out {
  background: var(--gray-700);
}

.product-info {
  padding: 20px;
  background: white;
  border-top: 1px solid var(--gray-200);
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--gray-800);
  line-height: 1.4;
  height: 2.8em;
  transition: color var(--transition-fast);
}

.product-name:hover {
  color: var(--primary-color);
}

.product-price {
  color: var(--secondary-color);
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.product-price::before {
  content: '￥';
  font-size: 16px;
  margin-right: 2px;
  font-weight: normal;
}

.product-stock {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.low-stock {
  color: var(--warning-color);
  font-weight: 500;
}

.stock-warning {
  color: white;
  background: var(--warning-color);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 187, 51, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 187, 51, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 187, 51, 0);
  }
}

.product-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.product-actions .el-button {
  flex: 1;
  padding: 10px 0;
  border-radius: 6px;
}

.product-actions .el-button i {
  margin-right: 5px;
}

.cart-message {
  background: linear-gradient(135deg, var(--success-color), #20934a);
  color: white;
  border-radius: var(--border-radius);
}

@media (max-width: 768px) {
  .product-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .product-actions .el-button {
    width: 100%;
  }
  
  .image-container {
    height: 180px;
  }
}
</style> 