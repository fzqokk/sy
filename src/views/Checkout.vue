<template>
  <div class="checkout-page">
    <Header />
    
    <div class="main-content">
      <h1 class="page-title">订单结算</h1>
      
      <el-steps :active="activeStep" finish-status="success" class="checkout-steps">
        <el-step title="确认订单信息"></el-step>
        <el-step title="支付"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      
      <!-- 步骤一：确认订单 -->
      <div v-if="activeStep === 0" class="step-content">
        <!-- 收货地址选择 -->
        <div class="section-title">收货地址</div>
        <div class="address-section">
          <el-card class="address-card" v-if="!showAddressForm" shadow="hover">
            <div class="address-info">
              <div class="address-user">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <div class="address-detail">{{ address.province + address.city + address.district + address.detail }}</div>
            </div>
            <div class="address-actions">
              <el-button type="primary" size="small" @click="showAddressForm = true">修改</el-button>
            </div>
          </el-card>
          
          <el-form v-else :model="address" :rules="addressRules" ref="addressFormRef" label-width="100px" class="address-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收货人" prop="name">
                  <el-input v-model="address.name" placeholder="请输入收货人姓名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="address.phone" placeholder="请输入联系电话"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" prop="province">
                  <el-select v-model="address.province" placeholder="请选择省份" style="width: 100%">
                    <el-option 
                      v-for="province in provinces" 
                      :key="province.value" 
                      :label="province.label" 
                      :value="province.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" prop="city">
                  <el-select v-model="address.city" placeholder="请选择城市" style="width: 100%" :disabled="!address.province">
                    <el-option 
                      v-for="city in cities" 
                      :key="city.value" 
                      :label="city.label" 
                      :value="city.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区县" prop="district">
                  <el-select v-model="address.district" placeholder="请选择区县" style="width: 100%" :disabled="!address.city">
                    <el-option 
                      v-for="district in districts" 
                      :key="district.value" 
                      :label="district.label" 
                      :value="district.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="详细地址" prop="detail">
              <el-input v-model="address.detail" type="textarea" :rows="2" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveAddress">保存</el-button>
              <el-button @click="showAddressForm = false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 商品清单 -->
        <div class="section-title">商品清单</div>
        <div class="order-items">
          <el-table 
            :data="orderItems" 
            style="width: 100%" 
            border
            :height="400"
            :resize-observer="false">
            <el-table-column label="商品信息" min-width="400">
              <template #default="scope">
                <div class="product-info">
                  <div class="product-image">
                    <img :src="scope.row.images[0]" />
                  </div>
                  <div class="product-name">
                    {{ scope.row.name }}
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="单价" width="100" align="center">
              <template #default="scope">
                <div class="product-price">¥{{ scope.row.price }}</div>
              </template>
            </el-table-column>
            
            <el-table-column label="数量" width="100" align="center">
              <template #default="scope">
                <div class="product-quantity">{{ scope.row.quantity }}</div>
              </template>
            </el-table-column>
            
            <el-table-column label="小计" width="120" align="center">
              <template #default="scope">
                <div class="product-subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 支付方式 -->
        <div class="section-title">支付方式</div>
        <div class="payment-section">
          <div class="payment-methods">
            <div class="payment-method-item" :class="{ active: paymentMethod === 'alipay' }" @click="selectPaymentMethod('alipay')">
              <div class="payment-icon">
                <img :src="require('@/assets/pay/alipay.png')" alt="支付宝" />
              </div>
              <div class="payment-name">支付宝</div>
              <el-radio v-model="paymentMethod" label="alipay"></el-radio>
            </div>
            <div class="payment-method-item" :class="{ active: paymentMethod === 'wechat' }" @click="selectPaymentMethod('wechat')">
              <div class="payment-icon">
                <img :src="require('@/assets/pay/wechat.png')" alt="微信支付" />
              </div>
              <div class="payment-name">微信支付</div>
              <el-radio v-model="paymentMethod" label="wechat"></el-radio>
            </div>
            <div class="payment-method-item" :class="{ active: paymentMethod === 'bankcard' }" @click="selectPaymentMethod('bankcard')">
              <div class="payment-icon">
                <img :src="require('@/assets/pay/bank-card.png')" alt="银行卡" />
              </div>
              <div class="payment-name">银行卡支付</div>
              <el-radio v-model="paymentMethod" label="bankcard"></el-radio>
            </div>
          </div>
        </div>
        
        <!-- 订单汇总 -->
        <div class="order-summary">
          <div class="summary-item">
            <span class="summary-label">商品总额：</span>
            <span class="summary-value">¥{{ orderTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">运费：</span>
            <span class="summary-value">¥{{ shippingCost.toFixed(2) }}</span>
          </div>
          <div class="summary-total">
            <span class="total-label">应付金额：</span>
            <span class="total-value">¥{{ (orderTotal + shippingCost).toFixed(2) }}</span>
          </div>
          <el-button type="danger" size="large" @click="submitOrder" :loading="submitting">
            提交订单
          </el-button>
        </div>
      </div>
      
      <!-- 步骤二：支付 -->
      <div v-else-if="activeStep === 1" class="step-content">
        <div class="payment-info">
          <el-alert title="这是模拟支付环节，实际项目中应对接真实支付接口" type="info" :closable="false"></el-alert>
          
          <div class="payment-details">
            <h2>订单支付</h2>
            <p class="order-id">订单号：{{ currentOrder.id }}</p>
            <p class="payment-amount">支付金额：<span>¥{{ (orderTotal + shippingCost).toFixed(2) }}</span></p>
            
            <div class="payment-qrcode">
              <div class="qrcode-container">
                <img v-if="paymentMethod === 'alipay'" :src="require('@/assets/pay/alipay.png')" alt="支付宝支付码" />
                <img v-else-if="paymentMethod === 'wechat'" :src="require('@/assets/pay/wechat.png')" alt="微信支付码" />
                <img v-else-if="paymentMethod === 'bankcard'" :src="require('@/assets/pay/bank-card.png')" alt="银行卡支付" />
              </div>
              <p v-if="paymentMethod === 'alipay'">请使用支付宝扫一扫，扫描上方二维码完成支付</p>
              <p v-else-if="paymentMethod === 'wechat'">请使用微信扫一扫，扫描上方二维码完成支付</p>
              <p v-else-if="paymentMethod === 'bankcard'">请使用网上银行完成支付</p>
              
              <div class="payment-guide">
                <div v-if="paymentMethod === 'alipay'" class="guide-steps">
                  <div class="step">1. 打开支付宝APP</div>
                  <div class="step">2. 点击右上角"扫一扫"</div>
                  <div class="step">3. 扫描上方二维码</div>
                  <div class="step">4. 确认支付金额并完成支付</div>
                </div>
                <div v-else-if="paymentMethod === 'wechat'" class="guide-steps">
                  <div class="step">1. 打开微信APP</div>
                  <div class="step">2. 点击右上角"+"，选择"扫一扫"</div>
                  <div class="step">3. 扫描上方二维码</div>
                  <div class="step">4. 确认支付金额并完成支付</div>
                </div>
                <div v-else-if="paymentMethod === 'bankcard'" class="guide-steps">
                  <div class="step">1. 登录您的网上银行</div>
                  <div class="step">2. 选择转账功能</div>
                  <div class="step">3. 输入订单金额</div>
                  <div class="step">4. 完成支付并在下方点击按钮</div>
                </div>
              </div>
            </div>
            
            <el-button type="success" size="large" @click="simulatePayment" :loading="paying">
              模拟支付成功
            </el-button>
            <el-button @click="goToPage(0)">返回修改订单</el-button>
          </div>
        </div>
      </div>
      
      <!-- 步骤三：完成 -->
      <div v-else-if="activeStep === 2" class="step-content">
        <div class="order-success">
          <el-result icon="success" title="订单提交成功" :sub-title="`订单号: ${currentOrder.id}`">
            <template #extra>
              <el-button type="primary" @click="goToPage('/orders')">查看订单</el-button>
              <el-button @click="goToPage('/')">继续购物</el-button>
            </template>
          </el-result>
        </div>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'

export default {
  name: 'CheckoutView',
  components: {
    Header
  },
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const ordersStore = useOrdersStore()
    const router = useRouter()
    
    // 当前步骤
    const activeStep = ref(0)
    
    // 订单商品
    const orderItems = ref([])
    
    // 省份数据
    const provinces = ref([
      { label: '广东省', value: '广东省' },
      { label: '北京市', value: '北京市' },
      { label: '上海市', value: '上海市' },
      { label: '江苏省', value: '江苏省' },
      { label: '浙江省', value: '浙江省' }
    ])
    
    // 城市数据 - 按省份组织
    const citiesData = {
      '广东省': [
        { label: '广州市', value: '广州市' },
        { label: '深圳市', value: '深圳市' },
        { label: '东莞市', value: '东莞市' },
        { label: '佛山市', value: '佛山市' },
        { label: '珠海市', value: '珠海市' }
      ],
      '北京市': [
        { label: '北京市', value: '北京市' }
      ],
      '上海市': [
        { label: '上海市', value: '上海市' }
      ],
      '江苏省': [
        { label: '南京市', value: '南京市' },
        { label: '苏州市', value: '苏州市' },
        { label: '无锡市', value: '无锡市' },
        { label: '常州市', value: '常州市' },
        { label: '南通市', value: '南通市' }
      ],
      '浙江省': [
        { label: '杭州市', value: '杭州市' },
        { label: '宁波市', value: '宁波市' },
        { label: '温州市', value: '温州市' },
        { label: '绍兴市', value: '绍兴市' },
        { label: '嘉兴市', value: '嘉兴市' }
      ]
    }
    
    // 区县数据 - 按城市组织
    const districtsData = {
      '广州市': [
        { label: '天河区', value: '天河区' },
        { label: '越秀区', value: '越秀区' },
        { label: '海珠区', value: '海珠区' },
        { label: '白云区', value: '白云区' },
        { label: '黄埔区', value: '黄埔区' },
        { label: '番禺区', value: '番禺区' },
        { label: '花都区', value: '花都区' },
        { label: '南沙区', value: '南沙区' },
        { label: '从化区', value: '从化区' },
        { label: '增城区', value: '增城区' }
      ],
      '深圳市': [
        { label: '福田区', value: '福田区' },
        { label: '罗湖区', value: '罗湖区' },
        { label: '南山区', value: '南山区' },
        { label: '宝安区', value: '宝安区' },
        { label: '龙岗区', value: '龙岗区' },
        { label: '龙华区', value: '龙华区' },
        { label: '盐田区', value: '盐田区' },
        { label: '坪山区', value: '坪山区' },
        { label: '光明区', value: '光明区' }
      ],
      '珠海市': [
        { label: '香洲区', value: '香洲区' },
        { label: '斗门区', value: '斗门区' },
        { label: '金湾区', value: '金湾区' },
        { label: '横琴新区', value: '横琴新区' },
        { label: '高新区', value: '高新区' }
      ],
      '佛山市': [
        { label: '禅城区', value: '禅城区' },
        { label: '南海区', value: '南海区' },
        { label: '顺德区', value: '顺德区' },
        { label: '高明区', value: '高明区' },
        { label: '三水区', value: '三水区' }
      ],
      '东莞市': [
        { label: '东城街道', value: '东城街道' },
        { label: '南城街道', value: '南城街道' },
        { label: '万江街道', value: '万江街道' },
        { label: '莞城街道', value: '莞城街道' },
        { label: '石碣镇', value: '石碣镇' },
        { label: '石龙镇', value: '石龙镇' },
        { label: '茶山镇', value: '茶山镇' },
        { label: '虎门镇', value: '虎门镇' },
        { label: '长安镇', value: '长安镇' }
      ],
      '北京市': [
        { label: '东城区', value: '东城区' },
        { label: '西城区', value: '西城区' },
        { label: '朝阳区', value: '朝阳区' },
        { label: '海淀区', value: '海淀区' },
        { label: '丰台区', value: '丰台区' },
        { label: '石景山区', value: '石景山区' },
        { label: '门头沟区', value: '门头沟区' },
        { label: '房山区', value: '房山区' },
        { label: '通州区', value: '通州区' },
        { label: '顺义区', value: '顺义区' }
      ],
      '上海市': [
        { label: '黄浦区', value: '黄浦区' },
        { label: '徐汇区', value: '徐汇区' },
        { label: '长宁区', value: '长宁区' },
        { label: '静安区', value: '静安区' },
        { label: '浦东新区', value: '浦东新区' },
        { label: '普陀区', value: '普陀区' },
        { label: '虹口区', value: '虹口区' },
        { label: '杨浦区', value: '杨浦区' },
        { label: '宝山区', value: '宝山区' },
        { label: '嘉定区', value: '嘉定区' }
      ],
      '南京市': [
        { label: '鼓楼区', value: '鼓楼区' },
        { label: '玄武区', value: '玄武区' },
        { label: '秦淮区', value: '秦淮区' },
        { label: '建邺区', value: '建邺区' },
        { label: '雨花台区', value: '雨花台区' },
        { label: '栖霞区', value: '栖霞区' },
        { label: '江宁区', value: '江宁区' },
        { label: '浦口区', value: '浦口区' }
      ],
      '苏州市': [
        { label: '姑苏区', value: '姑苏区' },
        { label: '虎丘区', value: '虎丘区' },
        { label: '吴中区', value: '吴中区' },
        { label: '相城区', value: '相城区' },
        { label: '吴江区', value: '吴江区' }
      ],
      '无锡市': [
        { label: '梁溪区', value: '梁溪区' },
        { label: '锡山区', value: '锡山区' },
        { label: '惠山区', value: '惠山区' },
        { label: '滨湖区', value: '滨湖区' },
        { label: '新吴区', value: '新吴区' }
      ],
      '常州市': [
        { label: '天宁区', value: '天宁区' },
        { label: '钟楼区', value: '钟楼区' },
        { label: '新北区', value: '新北区' },
        { label: '武进区', value: '武进区' },
        { label: '金坛区', value: '金坛区' }
      ],
      '南通市': [
        { label: '崇川区', value: '崇川区' },
        { label: '港闸区', value: '港闸区' },
        { label: '通州区', value: '通州区' },
        { label: '如东县', value: '如东县' },
        { label: '启东市', value: '启东市' }
      ],
      '杭州市': [
        { label: '西湖区', value: '西湖区' },
        { label: '上城区', value: '上城区' },
        { label: '滨江区', value: '滨江区' },
        { label: '拱墅区', value: '拱墅区' },
        { label: '江干区', value: '江干区' },
        { label: '下城区', value: '下城区' },
        { label: '余杭区', value: '余杭区' },
        { label: '萧山区', value: '萧山区' }
      ],
      '宁波市': [
        { label: '海曙区', value: '海曙区' },
        { label: '江北区', value: '江北区' },
        { label: '北仑区', value: '北仑区' },
        { label: '镇海区', value: '镇海区' },
        { label: '鄞州区', value: '鄞州区' }
      ],
      '温州市': [
        { label: '鹿城区', value: '鹿城区' },
        { label: '龙湾区', value: '龙湾区' },
        { label: '瓯海区', value: '瓯海区' },
        { label: '洞头区', value: '洞头区' },
        { label: '永嘉县', value: '永嘉县' }
      ],
      '绍兴市': [
        { label: '越城区', value: '越城区' },
        { label: '柯桥区', value: '柯桥区' },
        { label: '上虞区', value: '上虞区' },
        { label: '诸暨市', value: '诸暨市' },
        { label: '嵊州市', value: '嵊州市' }
      ],
      '嘉兴市': [
        { label: '南湖区', value: '南湖区' },
        { label: '秀洲区', value: '秀洲区' },
        { label: '海宁市', value: '海宁市' },
        { label: '平湖市', value: '平湖市' },
        { label: '桐乡市', value: '桐乡市' }
      ]
    }
    
    // 当前可选城市列表
    const cities = ref([])
    
    // 当前可选区县列表
    const districts = ref([])
    
    // 收货地址
    const address = ref({
      name: '张三',
      phone: '13812345678',
      province: '',
      city: '',
      district: '',
      detail: '软件园E栋123室'
    })
    
    // 监听省份变化，更新城市列表
    watch(() => address.value.province, (newProvince) => {
      if (newProvince) {
        const cityData = citiesData[newProvince] || []
        // 确保cities是数组而不是对象
        cities.value = Array.isArray(cityData) ? cityData : []
        // 重置城市和区县
        address.value.city = ''
        address.value.district = ''
        districts.value = []
      } else {
        cities.value = []
      }
    })
    
    // 监听城市变化，更新区县列表
    watch(() => address.value.city, (newCity) => {
      if (newCity) {
        const districtData = districtsData[newCity] || []
        // 确保districts是数组而不是对象
        districts.value = Array.isArray(districtData) ? districtData : []
        // 重置区县
        address.value.district = ''
      } else {
        districts.value = []
      }
    })
    
    // 地址表单验证规则
    const addressRules = {
      name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      province: [{ required: true, message: '请选择省份', trigger: 'change' }],
      city: [{ required: true, message: '请选择城市', trigger: 'change' }],
      district: [{ required: true, message: '请选择区县', trigger: 'change' }],
      detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
    }
    
    // 显示地址表单
    const showAddressForm = ref(false)
    
    // 支付方式
    const paymentMethod = ref('alipay')
    
    // 支付方式名称
    const paymentMethodName = computed(() => {
      const methods = {
        alipay: '支付宝',
        wechat: '微信支付',
        bankcard: '银行卡'
      }
      return methods[paymentMethod.value] || '支付宝'
    })
    
    // 商品总额
    const orderTotal = computed(() => {
      return orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
    })
    
    // 运费
    const shippingCost = ref(10)
    
    // 订单提交状态
    const submitting = ref(false)
    
    // 支付中状态
    const paying = ref(false)
    
    // 当前订单
    const currentOrder = ref(null)
    
    // 表单引用
    const addressFormRef = ref(null)
    
    // 初始化
    onMounted(() => {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再结算')
        router.push('/login')
        return
      }
      
      // 检查是否有从订单页面跳转过来的待支付订单ID
      const pendingOrderId = localStorage.getItem('currentOrderId')
      
      if (pendingOrderId) {
        console.log('检测到待支付订单ID:', pendingOrderId)
        
        // 获取待支付订单
        const pendingOrder = ordersStore.getOrderById(pendingOrderId)
        
        if (pendingOrder) {
          console.log('找到待支付订单:', pendingOrder)
          
          // 设置当前订单
          currentOrder.value = pendingOrder
          
          // 设置订单商品
          orderItems.value = pendingOrder.items
          
          // 设置地址信息
          if (pendingOrder.address) {
            address.value = {
              name: pendingOrder.address.name || '',
              phone: pendingOrder.address.phone || '',
              province: pendingOrder.address.province || '',
              city: pendingOrder.address.city || '',
              district: pendingOrder.address.district || '',
              detail: pendingOrder.address.detail || ''
            }
          }
          
          // 设置支付方式
          if (pendingOrder.paymentMethod) {
            paymentMethod.value = pendingOrder.paymentMethod
          }
          
          // 直接跳转到支付步骤
          activeStep.value = 1
          
          // 清除localStorage中的订单ID，避免刷新页面时重复加载
          localStorage.removeItem('currentOrderId')
          
          return
        } else {
          console.error('未找到对应的待支付订单:', pendingOrderId)
          ElMessage.warning('未找到对应的待支付订单')
          localStorage.removeItem('currentOrderId')
        }
      }
      
      // 如果没有待支付订单，则从本地存储获取结算商品
      const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]')
      
      if (checkoutItems.length === 0) {
        ElMessage.warning('没有选择要结算的商品')
        router.push('/cart')
        return
      }
      
      orderItems.value = checkoutItems
      
      // 设置默认省份，触发城市列表加载
      address.value.province = '广东省'
    })
    
    // 保存地址
    const saveAddress = () => {
      if (!addressFormRef.value) return
      
      addressFormRef.value.validate((valid) => {
        if (valid) {
          showAddressForm.value = false
        }
      })
    }
    
    // 提交订单
    const submitOrder = async () => {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        ElMessage.error('用户未登录，请先登录')
        router.push('/login')
        return
      }
      
      // 检查购物车和结算商品
      if (orderItems.value.length === 0) {
        ElMessage.warning('没有选择要结算的商品')
        router.push('/cart')
        return
      }
      
      // 验证地址是否完整
      if (!address.value.province || !address.value.city || !address.value.district || !address.value.detail) {
        ElMessage.warning('请完善收货地址信息')
        showAddressForm.value = true
        return
      }
      
      // 检查收货人姓名和手机号
      if (!address.value.name || !address.value.phone) {
        ElMessage.warning('请输入收货人姓名和联系电话')
        showAddressForm.value = true
        return
      }
      
      submitting.value = true
      
      try {
        console.log('创建订单中...', {
          userId: userStore.currentUser?.id,
          orderItems: orderItems.value.length,
          address: address.value,
          paymentMethod: paymentMethod.value
        })
        
        // 确保订单数据结构正确初始化
        ordersStore.initOrdersData()
        
        // 创建订单
        const order = await ordersStore.createOrder({
          address: {
            name: address.value.name,
            phone: address.value.phone,
            province: address.value.province,
            city: address.value.city,
            district: address.value.district,
            detail: address.value.detail
          },
          paymentMethod: paymentMethod.value
        })
        
        if (!order) {
          console.error('订单返回为空')
          throw new Error('订单创建失败')
        }
        
        console.log('订单创建成功:', order)
        currentOrder.value = order
        
        // 移动到支付步骤
        activeStep.value = 1
      } catch (error) {
        console.error('订单创建错误:', error)
        ElMessage.error('订单创建失败：' + (error.message || '未知错误'))
      } finally {
        submitting.value = false
      }
    }
    
    // 模拟支付
    const simulatePayment = async () => {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !currentOrder.value) {
        ElMessage.error('用户未登录或订单不存在')
        return
      }
      
      paying.value = true
      
      try {
        console.log('开始模拟支付:', {
          orderId: currentOrder.value.id,
          userId: userStore.currentUser?.id,
          paymentMethod: paymentMethod.value
        })
        
        // 模拟支付延时
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 获取订单并确保存在
        const userOrder = ordersStore.getOrderById(currentOrder.value.id)
        if (!userOrder) {
          throw new Error('订单不存在或无权操作')
        }
        
        console.log('订单验证通过，正在处理支付:', userOrder.id)
        
        // 支付订单
        await ordersStore.payOrder(currentOrder.value.id)
        
        console.log('支付完成，更新界面状态')
        
        // 移动到完成步骤
        activeStep.value = 2
        
        // 从购物车中移除已支付的商品
        if (orderItems.value && orderItems.value.length > 0) {
          console.log('正在从购物车中移除已支付商品...')
          // 获取所有已支付商品的ID
          const paidProductIds = orderItems.value.map(item => item.id)
          
          // 从购物车中移除
          paidProductIds.forEach(productId => {
            // 检查购物车中是否存在该商品
            const existsInCart = cartStore.items.some(item => item.id === productId)
            if (existsInCart) {
              console.log(`从购物车移除商品: ${productId}`)
              cartStore.removeItem(productId)
            }
          })
        }
        
        // 清除结算商品信息
        localStorage.removeItem('checkoutItems')
        
        // 清除待支付订单ID
        localStorage.removeItem('currentOrderId')
        
        // 显示成功信息
        ElMessage.success('支付成功')
      } catch (error) {
        console.error('支付过程中发生错误:', error)
        ElMessage.error('支付失败：' + (error.message || '未知错误'))
      } finally {
        paying.value = false
      }
    }
    
    // 选择支付方式
    const selectPaymentMethod = (method) => {
      paymentMethod.value = method
    }
    
    // 页面导航方法
    const goToPage = (path) => {
      if (typeof path === 'number') {
        activeStep.value = path
      } else {
        router.push(path)
      }
    }
    
    return {
      activeStep,
      orderItems,
      address,
      addressRules,
      showAddressForm,
      paymentMethod,
      paymentMethodName,
      orderTotal,
      shippingCost,
      submitting,
      paying,
      currentOrder,
      saveAddress,
      submitOrder,
      simulatePayment,
      provinces,
      cities,
      districts,
      selectPaymentMethod,
      goToPage,
      addressFormRef
    }
  }
}
</script>

<style scoped>
.checkout-page {
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

.checkout-steps {
  margin-bottom: 30px;
}

.step-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.address-section, .payment-section {
  margin-bottom: 30px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-user {
  margin-bottom: 10px;
}

.address-user .name {
  font-weight: bold;
  margin-right: 10px;
}

.address-user .phone {
  color: #909399;
}

.address-form {
  margin-top: 20px;
}

.order-items {
  margin-bottom: 30px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.order-summary {
  text-align: right;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.summary-item {
  margin-bottom: 10px;
}

.summary-label {
  margin-right: 10px;
}

.summary-total {
  margin: 20px 0;
  font-size: 18px;
}

.total-value {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.payment-info {
  text-align: center;
}

.payment-details {
  margin-top: 30px;
  padding: 30px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: inline-block;
}

.order-id {
  color: #909399;
  margin-bottom: 10px;
}

.payment-amount {
  margin-bottom: 20px;
}

.payment-amount span {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.payment-qrcode {
  margin: 20px 0 30px;
}

.qrcode-container {
  width: 220px;
  height: 220px;
  margin: 0 auto 15px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.order-success {
  padding: 30px 0;
  text-align: center;
}

.footer {
  background-color: #303133;
  color: #fff;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

.payment-guide {
  margin-top: 15px;
  text-align: left;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.guide-steps {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 15px;
  font-size: 14px;
}

.step {
  padding: 8px 0;
  border-bottom: 1px dashed #e0e0e0;
  color: #606266;
}

.step:last-child {
  border-bottom: none;
}

.payment-methods {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.payment-method-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 180px;
}

.payment-method-item:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.payment-method-item.active {
  border-color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.05);
}

.payment-icon {
  width: 80px;
  height: 60px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.payment-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.payment-method-item:not(.active) .el-radio__input {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .page-title {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .order-summary {
    text-align: center;
  }
  
  .order-summary .el-button {
    width: 100%;
    margin-top: 15px;
  }
  
  .payment-methods {
    flex-direction: column;
    align-items: center;
  }
  
  .payment-method-item {
    width: 100%;
    max-width: none;
  }
}
</style> 