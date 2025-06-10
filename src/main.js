/**
 * 主应用入口文件
 * 配置Vue应用、注册全局组件和指令、设置错误处理
 */

// 导入核心Vue库和主组件
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入状态管理库
import { createPinia } from 'pinia'

// 导入Element Plus及其样式和中文语言包
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 导入axios用于API请求
import axios from 'axios'

// 全局配置axios基础URL
axios.defaults.baseURL = '/api'

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理实例
const pinia = createPinia()

/**
 * Element Plus全局配置
 * - size: 组件默认尺寸
 * - zIndex: 弹窗层级
 * - locale: 使用中文
 * - experimentalFeatures: 启用实验性表单功能，提升响应性
 */
const elementPlusOptions = {
  size: 'default',
  zIndex: 3000,
  locale: zhCn,
  experimentalFeatures: {
    form: true
  }
}

// 注册全局插件和组件
app.use(router)    // 注册路由
   .use(pinia)     // 注册状态管理
   .use(ElementPlus, elementPlusOptions)  // 注册Element Plus组件库

/**
 * 全局错误处理
 * 捕获应用运行时错误并进行处理
 */
// eslint-disable-next-line no-unused-vars
app.config.errorHandler = (err, _vm, _info) => {
  // 记录错误到控制台
  console.error('Vue Error:', err);
  
  // 定义不需要显示给用户的错误类型
  const ignoreErrors = [
    'ResizeObserver',                     // ResizeObserver相关错误
    'Cannot read properties of undefined', // 空引用错误
    'Failed to load resource',            // 资源加载失败
    '404 (Not Found)'                     // 资源未找到
  ];
  
  // 如果是需要忽略的错误类型，不做额外处理
  if (ignoreErrors.some(msg => err.toString().includes(msg))) {
    return;
  }
  
  // 其他重要错误可以显示给用户
  // ElMessage.error('应用出现错误，请刷新页面');
};

/**
 * 修复Element Plus输入框实时显示问题
 * 解决Vue 3中输入框绑定值更新延迟的问题
 */
document.addEventListener('DOMContentLoaded', () => {
  /**
   * 为所有Element Plus输入框添加实时更新修复
   * 通过手动触发change事件强制更新数据绑定
   */
  const applyInputFix = () => {
    const inputs = document.querySelectorAll('.el-input__inner');
    inputs.forEach(input => {
      // 避免重复添加事件监听器
      if (!input.dataset.fixApplied) {
        input.dataset.fixApplied = 'true';
        input.addEventListener('input', (e) => {
          // 强制触发变更检测，确保v-model即时更新
          e.target.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    });
  };
  
  // 页面加载完成后初始应用修复
  applyInputFix();
  
  // 使用MutationObserver监听DOM变化，对动态添加的输入框应用修复
  const observer = new MutationObserver(() => {
    applyInputFix();
  });
  
  // 监听整个body元素及其子元素的变化
  observer.observe(document.body, {
    childList: true,  // 监听子节点添加或删除
    subtree: true     // 监听所有后代节点
  });
});

/**
 * 全局图片错误处理函数
 * 当图片加载失败时替换为默认图片
 */
app.config.globalProperties.$handleImageError = (e) => {
  // 替换为本地默认图片
  e.target.src = require('@/assets/logo.png');
};

/**
 * 图片加载失败指令(v-img-fallback)
 * 在任何组件中使用此指令可以实现图片加载失败时的替换功能
 */
app.directive('img-fallback', {
  mounted(el) {
    // 监听图片加载错误事件
    el.addEventListener('error', () => {
      // 替换为默认图片
      el.src = require('@/assets/logo.png');
    });
  }
});

/**
 * 修复ResizeObserver循环错误
 * 解决Element Plus在某些场景下产生的ResizeObserver相关错误
 */
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver loop')) {
    // 阻止错误事件继续传播
    event.stopImmediatePropagation();
  }
}, true); // 捕获阶段处理错误

// 挂载应用到#app元素
app.mount('#app')
