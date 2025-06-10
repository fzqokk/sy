<template>
  <div class="home">
    <Header />
    
    <div class="main-content">
      <!-- 轮播图部分 -->
      <div class="banner-container">
        <el-carousel :interval="4000" type="card" height="450px" class="banner" indicator-position="outside">
          <el-carousel-item v-for="(banner, index) in banners" :key="index" class="banner-item">
            <div class="banner-content shine-effect">
              <img :src="banner.image" :alt="`Banner ${index + 1}`" class="banner-image" v-img-fallback>
              <div class="banner-info">
                <h2 class="banner-title">{{ banner.title }}</h2>
                <p class="banner-desc">{{ banner.description }}</p>
                <el-button type="primary" size="large" class="btn-animated" @click="goToCategory(banner.link)">
                  {{ banner.buttonText }} <i class="el-icon-right"></i>
                </el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <!-- 分类导航 -->
      <div class="category-nav card-container">
        <h2 class="section-title">商品分类</h2>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="8" v-for="(category, index) in categories" :key="index">
            <div class="category-card shadow-hover" @click="goToCategory(category)">
              <div class="category-icon">
                <i :class="category.icon"></i>
              </div>
              <div class="category-content">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-desc">{{ category.description }}</div>
              </div>
              <div class="category-arrow">
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 热门商品 -->
      <div class="hot-products card-container">
        <div class="section-header">
          <h2 class="section-title">热门商品</h2>
          <el-button type="primary" text @click="goToProducts" class="view-more">
            查看全部 <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in hotProducts" :key="product.id">
            <ProductCard :product="product" />
          </el-col>
        </el-row>
      </div>
      
      <!-- 促销广告 -->
      <div class="promo-banner shadow-hover shine-effect">
        <div class="promo-content">
          <div class="promo-text">
            <h3 class="promo-title">夏季特惠活动</h3>
            <p class="promo-desc">全场商品满300减50，新用户立减30元</p>
            <el-button type="danger" size="large" class="btn-animated" @click="goToProducts">
              立即选购 <i class="el-icon-right"></i>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 新品上架 -->
      <div class="new-products card-container">
        <div class="section-header">
          <h2 class="section-title">新品上架</h2>
          <el-button type="primary" text @click="goToProducts" class="view-more">
            查看全部 <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in newProducts" :key="product.id">
            <ProductCard :product="product" />
          </el-col>
        </el-row>
      </div>
      
      <!-- 品牌推荐 -->
      <div class="brands card-container">
        <h2 class="section-title">品牌推荐</h2>
        <div class="brands-list">
          <div class="brand-item shadow-hover" v-for="(brand, index) in brands" :key="index">
            <div class="brand-logo">
              <img :src="brand.logo" :alt="brand.name" v-img-fallback>
            </div>
            <div class="brand-name">{{ brand.name }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 页脚 -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-top">
          <div class="footer-logo">
            <h2>东软商城</h2>
            <p>为您提供优质的购物体验</p>
          </div>
          <div class="footer-links">
            <div class="footer-section">
              <h3>关于我们</h3>
              <ul>
                <li><a href="#">公司简介</a></li>
                <li><a href="#">联系方式</a></li>
                <li><a href="#">招聘信息</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>帮助中心</h3>
              <ul>
                <li><a href="#">购物指南</a></li>
                <li><a href="#">支付方式</a></li>
                <li><a href="#">配送方式</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>服务支持</h3>
              <ul>
                <li><a href="#">售后政策</a></li>
                <li><a href="#">自助服务</a></li>
                <li><a href="#">相关下载</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 东软网上商城 - 基于Vue.js的购物网站实验项目</p>
          <p>广东东软学院Web前端开发技术课程</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'HomeView',
  components: {
    Header,
    ProductCard
  },
  setup() {
    const productsStore = useProductsStore()
    const router = useRouter()
    
    // 轮播图数据
    const banners = ref([
      {
        image: require('@/assets/images/banner1.jpg'),
        title: '新品上市',
        description: '探索最新科技产品，提升您的生活品质',
        buttonText: '立即查看',
        link: { path: '/products', query: { category: '电子产品' } }
      },
      {
        image: require('@/assets/images/banner2.jpg'),
        title: '时尚服饰',
        description: '展现个性风采，彰显品味生活',
        buttonText: '浏览系列',
        link: { path: '/products', query: { category: '服饰' } }
      },
      {
        image: require('@/assets/images/book.jpg'),
        title: '阅读的乐趣',
        description: '与经典相遇，与知识同行',
        buttonText: '查看书籍',
        link: { path: '/products', query: { category: '图书' } }
      }
    ])
    
    // 分类数据
    const categories = ref([
      { 
        name: '电子产品', 
        icon: 'el-icon-cpu', 
        path: '/products?category=电子产品',
        description: '手机、电脑、智能设备'
      },
      { 
        name: '服饰', 
        icon: 'el-icon-shopping-bag-1', 
        path: '/products?category=服饰',
        description: '男装、女装、童装、配饰'
      },
      { 
        name: '图书', 
        icon: 'el-icon-reading', 
        path: '/products?category=图书',
        description: '小说、教材、杂志、漫画'
      }
    ])
    
    // 品牌数据 - 使用brand文件夹中的本地图片
    const brands = ref([
      { name: '小米', logo: require('@/assets/brand/xiao.png') },
      { name: '华为', logo: require('@/assets/brand/华为.png') },
      { name: '苹果', logo: require('@/assets/brand/iphone.png') },
      { name: '三星', logo: require('@/assets/brand/sumsung.png') },
      { name: '联想', logo: require('@/assets/brand/lenovo.png') },
      { name: '戴尔', logo: require('@/assets/brand/daier.png') }
    ])
    
    // 热门商品
    const hotProducts = computed(() => {
      const products = productsStore.products
      return Array.isArray(products) && products.length > 0 
        ? products.slice(0, 4) 
        : []
    })
    
    // 新品上架
    const newProducts = computed(() => {
      const products = productsStore.products
      return Array.isArray(products) && products.length > 0 
        ? [...products].reverse().slice(0, 4) 
        : []
    })
    
    // 路由跳转方法
    const goToProducts = () => {
      router.push('/products')  // 跳转到产品列表页面
    }

    const goToCategory = (category) => {  // 根据不同类型的category参数处理跳转逻辑
      if (typeof category === 'string') {  // 如果category是字符串，按分类名跳转
        router.push({ path: '/products', query: { category } })
      } else if (category && category.path) {  // 如果category有path属性，直接使用该路径跳转
        router.push(category.path)
      } else if (category && category.query) {  // 如果category有query属性，使用query参数跳转到产品页
        router.push({ path: '/products', query: category.query })
      } else if (category && typeof category === 'object') {  // 如果category是对象，直接将整个对象作为路由参数
        router.push(category)
      } else {  // 默认情况：无参数或无效参数时，直接跳转到产品页
        router.push('/products')
      }
    }
    
    // 监听 productsStore 中的商品变化，确保库存更新后视图能及时更新
    watch(() => productsStore.products, (newProducts) => {
      console.log('首页检测到商品数据变化，更新视图');
    }, { deep: true });
    
    // 页面加载时获取商品数据
    onMounted(() => {
      console.log('首页加载中，检查商品数据')
      if (!productsStore.loaded) {
        productsStore.fetchProducts()
      } else {
        console.log('已有商品数据，无需重新获取')
      }
    })
    
    return {
      banners,
      categories,
      brands,
      hotProducts,
      newProducts,
      goToCategory,
      goToProducts
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
}

.main-content {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 轮播图样式 */
.banner-container {
  margin-bottom: 50px;
}

.banner-item {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.banner-content {
  position: relative;
  height: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.banner-item:hover .banner-image {
  transform: scale(1.05);
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0));
  color: white;
}

.banner-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.8s forwards;
}

.banner-desc {
  font-size: 18px;
  margin-bottom: 20px;
  opacity: 0;
  max-width: 80%;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  transform: translateY(20px);
  animation: fadeInUp 0.8s 0.2s forwards;
}

.banner-info .el-button {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s 0.4s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分类导航样式 */
.category-card {
  display: flex;
  align-items: center;
  padding: 25px;
  background-color: white;
  border-radius: var(--border-radius);
  margin-bottom: 15px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.category-card:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-light));
  transition: transform var(--transition-fast);
  transform: scaleY(0);
  transform-origin: bottom;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.category-card:hover:before {
  transform: scaleY(1);
}

.category-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 28px;
  flex-shrink: 0;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
}

.category-card:hover .category-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 15px rgba(74, 108, 247, 0.3);
}

.category-content {
  flex: 1;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--gray-800);
}

.category-desc {
  font-size: 14px;
  color: var(--gray-600);
}

.category-arrow {
  margin-left: 10px;
  color: var(--gray-400);
  transition: all var(--transition-fast);
}

.category-card:hover .category-arrow {
  color: var(--primary-color);
  transform: translateX(5px);
}

/* 部分标题样式 */
.section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 25px;
  color: var(--gray-800);
  position: relative;
  padding-bottom: 12px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.view-more {
  font-size: 16px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.view-more i {
  margin-left: 5px;
  transition: transform var(--transition-fast);
}

.view-more:hover i {
  transform: translateX(5px);
}

/* 促销广告 */
.promo-banner {
  margin: 50px 0;
  height: 220px;
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.promo-banner:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.promo-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 50px;
}

.promo-text {
  max-width: 60%;
  color: white;
}

.promo-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.promo-desc {
  font-size: 18px;
  margin-bottom: 20px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* 品牌推荐 */
.brands-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.brand-item {
  flex: 1;
  min-width: calc(16.66% - 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.brand-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.brand-logo {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  transition: transform var(--transition-normal);
}

.brand-item:hover .brand-logo {
  transform: scale(1.1);
}

.brand-logo img {
  max-width: 100%;
  max-height: 100%;
}

.brand-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-700);
}

/* 页脚样式 */
.footer {
  background: linear-gradient(to right, #2c3e50, #4a5568);
  color: white;
  padding: 60px 0 30px;
  margin-top: 80px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.footer-logo h2 {
  margin-bottom: 15px;
  font-size: 28px;
  background: linear-gradient(to right, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-logo p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  color: rgba(255, 255, 255, 0.9);
}

.footer-section h3:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background: var(--primary-light);
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 12px;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  display: inline-block;
}

.footer-section a:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--primary-light);
  transition: width var(--transition-fast);
}

.footer-section a:hover {
  color: white;
}

.footer-section a:hover:after {
  width: 100%;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

@media (max-width: 992px) {
  .footer-top {
    flex-direction: column;
  }
  
  .footer-logo {
    margin-bottom: 30px;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 30px;
  }
  
  .promo-banner {
    height: 250px;
  }
  
  .promo-text {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .banner-title {
    font-size: 24px;
  }
  
  .banner-desc {
    font-size: 14px;
    max-width: 100%;
  }
  
  .category-card {
    padding: 15px;
  }
  
  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 20px;
  }
  
  .brand-item {
    min-width: calc(33.33% - 15px);
  }
  
  .banner-info {
    padding: 20px;
  }
  
  .promo-content {
    padding: 0 20px;
  }
  
  .promo-title {
    font-size: 24px;
  }
  
  .promo-desc {
    font-size: 14px;
  }
}
</style> 