<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <h3>fzq的小商城</h3>
          <p>一个便捷的电商平台</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <ul>
              <li><a href="#">公司简介</a></li>
              <li><a href="#">联系方式</a></li>
              <li><a href="#">加入我们</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4>帮助中心</h4>
            <ul>
              <li><a href="#">购物指南</a></li>
              <li><a href="#">支付方式</a></li>
              <li><a href="#">售后服务</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4>商家服务</h4>
            <ul>
              <li><a href="#">商家入驻</a></li>
              <li><a href="#">商家中心</a></li>
              <li><a href="#">营销服务</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>© 2023 fzq的小商城. 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.app-footer {
  background-color: #f8f9fa;
  padding: 40px 0 20px;
  margin-top: auto;
  border-top: 1px solid #e9ecef;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}

.footer-logo {
  flex: 0 0 25%;
  margin-bottom: 20px;
}

.footer-logo h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.footer-logo p {
  font-size: 14px;
  color: var(--gray-600);
}

.footer-links {
  flex: 0 0 70%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.link-group {
  flex: 0 0 30%;
  margin-bottom: 20px;
}

.link-group h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: var(--gray-800);
}

.link-group ul {
  list-style: none;
  padding: 0;
}

.link-group li {
  margin-bottom: 8px;
}

.link-group a {
  color: var(--gray-600);
  font-size: 14px;
  transition: color 0.2s;
}

.link-group a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.footer-bottom p {
  font-size: 14px;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .footer-logo,
  .footer-links {
    flex: 0 0 100%;
  }
  
  .link-group {
    flex: 0 0 100%;
  }
}
</style> 