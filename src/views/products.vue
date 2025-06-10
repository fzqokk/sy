<template>
  <div class="products-page">
    <Header />
    
    <div class="main-content">
      <h1 class="page-title">商品列表</h1>
      
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-card>
          <div class="filter-options">
            <div class="filter-item">
              <span class="filter-label">分类：</span>
              <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </el-radio-button>
              </el-radio-group>
            </div>
            
            <div class="filter-item">
              <span class="filter-label">价格排序：</span>
              <el-radio-group v-model="priceOrder" @change="handlePriceOrderChange">
                <el-radio-button value="">默认</el-radio-button>
                <el-radio-button value="asc">价格从低到高</el-radio-button>
                <el-radio-button value="desc">价格从高到低</el-radio-button>
              </el-radio-group>
            </div>
            
            <div class="filter-item">
              <span class="filter-label">关键词：</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索商品关键词"
                clearable
                @input="handleSearch"
                style="width: 250px">
              </el-input>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 商品列表 -->
      <div class="products-list">
        <el-row :gutter="20">
          <template v-if="!loading">
            <template v-if="filteredProducts.length > 0">
              <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in filteredProducts" :key="product.id">
                <ProductCard :product="product" />
              </el-col>
            </template>
            <template v-else>
              <el-col :span="24">
                <el-empty description="没有找到匹配的商品" :image-size="200"></el-empty>
              </el-col>
            </template>
          </template>
          <template v-else>
            <el-col :span="24" class="loading-container">
              <el-skeleton :rows="5" animated />
              <el-skeleton :rows="5" animated />
              <el-skeleton :rows="5" animated />
            </el-col>
          </template>
        </el-row>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductsStore } from '@/stores/productsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import ProductCard from '@/components/ProductCard.vue'
import { debounce } from 'lodash'

export default {
  name: 'ProductsView',
  components: {
    Header,
    ProductCard
  },
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const route = useRoute()
    
    // 商品数据
    const loading = computed(() => productsStore.loading || false)
    const filteredProducts = computed(() => {
      const filtered = productsStore.filteredProducts || productsStore.products
      return Array.isArray(filtered) ? filtered : []
    })
    
    // 分类列表
    const categories = ref(['电子产品', '服饰', '图书'])
    
    // 筛选条件
    const selectedCategory = ref('')
    const priceOrder = ref('')
    const searchKeyword = ref('')
    
    // 处理URL参数
    onMounted(async () => {
      try {
        // 加载所有商品
        await productsStore.fetchProducts()
        
        // 从URL获取筛选条件
        if (route.query.category) {
          selectedCategory.value = route.query.category
          handleCategoryChange(selectedCategory.value)
        }
        
        if (route.query.keyword) {
          searchKeyword.value = route.query.keyword
          handleSearch(searchKeyword.value)
        }
      } catch (err) {
        console.error('加载商品数据失败:', err)
      }
    })
    
    // 分类筛选
    const handleCategoryChange = (category) => {
      productsStore.filterByCategory(category)
    }
    
    // 价格排序
    const handlePriceOrderChange = (order) => {
      if (order) {
        productsStore.sortByPrice(order)
      } else {
        // 重置为原始排序
        handleCategoryChange(selectedCategory.value)
      }
    }
    
    // 关键词搜索（使用防抖）
    const handleSearch = debounce((keyword) => {
      productsStore.searchProducts(keyword)
    }, 300)
    
    // 监听筛选条件变化
    watch(selectedCategory, (newValue) => {
      priceOrder.value = ''
      handleCategoryChange(newValue)
    })
    
    // 监听商品数据变化，以更新筛选后的商品列表
    watch(() => productsStore.products, (newProducts) => {
      console.log('商品列表页检测到商品数据变化，重新应用筛选条件');
      // 重新应用当前筛选条件
      if (selectedCategory.value) {
        handleCategoryChange(selectedCategory.value);
      } else if (priceOrder.value) {
        handlePriceOrderChange(priceOrder.value);
      } else if (searchKeyword.value) {
        handleSearch(searchKeyword.value);
      } else {
        // 如果没有筛选条件，则显示所有商品
        productsStore.filteredProducts = newProducts;
      }
    }, { deep: true });
    
    return {
      loading,
      filteredProducts,
      categories,
      selectedCategory,
      priceOrder,
      searchKeyword,
      handleCategoryChange,
      handlePriceOrderChange,
      handleSearch
    }
  }
}
</script>

<style scoped>
.products-page {
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

.filter-section {
  margin-bottom: 30px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  min-width: 70px;
  font-weight: bold;
  margin-right: 10px;
}

.products-list {
  margin-top: 20px;
}

.loading-container {
  padding: 20px;
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
  
  .page-title {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .filter-options {
    gap: 10px;
  }
  
  .filter-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-label {
    margin-bottom: 5px;
  }
  
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
}
</style> 