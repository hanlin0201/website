<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Link, AlertTriangle, Compass, X, ArrowRight, RefreshCw, XCircle } from 'lucide-vue-next'
import { supabase } from '@/supabaseClient'

const router = useRouter()
const pairs = ref([])
const loading = ref(false)

// --- 1. 罗盘刷新逻辑 ---
const fetchRandomPairings = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('herbal_pairings')
      .select('*')
      .limit(30)
    
    if (error) throw error
    
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    // 增加 isOpen 状态控制
    pairs.value = shuffled.slice(0, 12).map(item => ({
      ...item,
      isOpen: false
    }))
  } catch (e) {
    console.error('获取失败:', e)
    // 演示数据
    pairs.value = [
      { id: 1, type: 'good', left_herb: '枸杞', right_herb: '菊花', effect: '清肝明目', description: '枸杞滋补肝肾，菊花清热解毒。二者搭配，补而不腻，常用于目赤肿痛或视力减退。', isOpen: false },
      { id: 2, type: 'bad',  left_herb: '甘草', right_herb: '甘遂', effect: '十八反', description: '药性相反，同用产生剧烈毒性，损伤元气，属于十八反禁忌。', isOpen: false },
      { id: 3, type: 'good', left_herb: '黄芪', right_herb: '当归', effect: '气血双补', description: '当归补血活血，黄芪补气生血。气旺则血生，是补血汤的经典配伍。', isOpen: false }
    ]
  } finally {
    setTimeout(() => { loading.value = false }, 800)
  }
}

// --- 2. 交互逻辑 ---

// 点击切换状态
const togglePopup = (item) => {
  // 如果希望点击一个时关闭其他所有已打开的卡片，取消下面注释：
  // pairs.value.forEach(p => { if (p.id !== item.id) p.isOpen = false })
  
  item.isOpen = !item.isOpen
}

// 关闭卡片 (阻止冒泡，避免触发底部的 toggle)
const closePopup = (e, item) => {
  e.stopPropagation()
  item.isOpen = false
}

// 跳转药材
const navToHerb = (name) => {
  router.push(`/herb/${name}`)
}

onMounted(() => {
  fetchRandomPairings()
})
</script>

<template>
  <div class="herbal-match-section">
    
    <div class="match-header">
      <div class="title-area">
        <h2 class="main-title">百子柜 · 药对配伍</h2>
        <p class="sub-title">Traditional Herbal Pairing Dictionary</p>
      </div>

      <div class="refresh-control" @click="fetchRandomPairings">
        <div class="compass-box" :class="{ 'is-loading': loading }">
          <Compass :size="36" />
        </div>
        <div class="label-group">
          <span class="action-text">换一批</span>
          <span class="hint-text">转动罗盘洗牌</span>
        </div>
      </div>
    </div>

    <!-- 柜子容器 -->
    <div class="cabinet-container">
      <div class="cabinet-inner">
        
        <!-- 每一个格子 -->
        <div 
          v-for="item in pairs" 
          :key="item.id" 
          class="grid-cell"
        >
          <!-- 1. 抽屉正面 (底座) -->
          <div class="drawer-face" :class="item.type" @click="togglePopup(item)">
            <div class="brass-ring"></div>
            
            <div class="herb-names">
              <span class="herb-text">{{ item.left_herb }}</span>
              <div class="icon-wrap" :class="item.type">
                <Link v-if="item.type === 'good'" size="12" />
                <AlertTriangle v-else size="12" />
              </div>
              <span class="herb-text">{{ item.right_herb }}</span>
            </div>

            <div class="drawer-label">{{ item.effect }}</div>
            <div class="click-hint">点击查看解析</div>
          </div>

          <!-- 2. 弹出的详情卡片 (覆盖层) -->
          <Transition name="pop-up">
            <div 
              v-if="item.isOpen" 
              class="popup-card" 
              :class="item.type"
              @click.stop
            >
              <!-- 卡片头部 -->
              <div class="popup-header">
                <span class="popup-tag" :class="item.type">
                  {{ item.type === 'good' ? '宜 · 相使' : '忌 · 相反' }}
                </span>
                <button class="close-btn" @click="closePopup($event, item)">
                  <XCircle size="18" />
                </button>
              </div>

              <!-- 卡片内容 -->
              <div class="popup-content">
                <h3 class="popup-title">{{ item.effect }}</h3>
                <p class="popup-desc">
                  {{ item.description }}
                </p>
              </div>

              <!-- 卡片底部链接 -->
              <div class="popup-footer">
                <span class="link-pill" @click="navToHerb(item.left_herb)">
                  {{ item.left_herb }} <ArrowRight size="10" />
                </span>
                <span class="link-pill" @click="navToHerb(item.right_herb)">
                  {{ item.right_herb }} <ArrowRight size="10" />
                </span>
              </div>
            </div>
          </Transition>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.herbal-match-section {
  width: 100%;
  min-height: 100vh;
  padding: 60px 40px;
  background-color: #F8F5F2;
  font-family: 'Noto Serif SC', serif;
}

/* 头部样式保持不变 */
.match-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  max-width: 1100px; margin: 0 auto 40px;
  border-bottom: 2px solid #D7CCC8; padding-bottom: 15px;
}
.main-title { font-size: 2.2rem; color: #3E2723; margin: 0; letter-spacing: 2px; }
.sub-title { font-size: 0.9rem; color: #8D6E63; text-transform: uppercase; letter-spacing: 1px; }

.refresh-control { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.compass-box { color: #5D4037; transition: transform 0.3s; }
.compass-box.is-loading { animation: spin 0.8s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.label-group { display: flex; flex-direction: column; }
.action-text { font-weight: bold; color: #3E2723; font-size: 1.1rem; }
.hint-text { font-size: 0.75rem; color: #8D6E63; }

/* --- 柜子容器 --- */
.cabinet-container {
  max-width: 1100px; margin: 0 auto;
  background: #5D4037;
  padding: 25px; border-radius: 8px;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.2);
  border: 4px solid #4E342E;
}

.cabinet-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* --- 格子容器 --- */
.grid-cell {
  position: relative; /* 关键：作为绝对定位的父级 */
  height: 160px;
  border-radius: 6px;
  perspective: 1000px; /* 虽然不翻转，但保留透视给弹窗动画增加质感 */
}

/* --- 1. 抽屉正面 (常驻背景) --- */
.drawer-face {
  width: 100%; height: 100%;
  background: #FDFBF7;
  border: 1px solid #D7CCC8;
  border-bottom: 4px solid #A1887F;
  border-radius: 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.drawer-face:hover { transform: translateY(-2px); box-shadow: 0 8px 12px rgba(0,0,0,0.15); background: #fff; }
.drawer-face.bad { background: #FFF5F5; border-color: #EF9A9A; border-bottom-color: #E57373; }

.brass-ring { width: 32px; height: 6px; background: #8D6E63; border-radius: 3px; margin-bottom: 12px; opacity: 0.6; }
.herb-names { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.herb-text { font-size: 1.1rem; font-weight: bold; color: #3E2723; }
.icon-wrap { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.icon-wrap.good { background: #E8F5E9; color: #2E7D32; }
.icon-wrap.bad { background: #FFEBEE; color: #C62828; }
.drawer-label { font-size: 0.85rem; background: #EFEBE9; color: #5D4037; padding: 2px 8px; border-radius: 4px; }
.click-hint { font-size: 0.6rem; color: #BCAAA4; margin-top: 8px; opacity: 0; transition: opacity 0.2s; }
.drawer-face:hover .click-hint { opacity: 1; }


/* --- 2. 弹出的详情卡片 (Popup Overlay) --- */
.popup-card {
  position: absolute; /* 绝对定位，覆盖在格子上方 */
  top: 0; left: 0; width: 100%; height: 100%;
  background: #fff;
  border-radius: 6px;
  z-index: 10; /* 确保在抽屉上面 */
  display: flex; flex-direction: column;
  padding: 12px 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3); /* 更深的阴影，体现浮起感 */
  border: 1px solid #EFEBE9;
}
/* 不同类型的边框色 */
.popup-card.good { border-top: 4px solid #66BB6A; }
.popup-card.bad { border-top: 4px solid #EF5350; }

.popup-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px; padding-bottom: 6px;
  border-bottom: 1px dashed #EEE;
}
.popup-tag { font-size: 0.7rem; font-weight: bold; color: #fff; padding: 2px 8px; border-radius: 12px; }
.popup-tag.good { background: #66BB6A; }
.popup-tag.bad { background: #EF5350; }

.close-btn {
  background: none; border: none; cursor: pointer; color: #BCAAA4; padding: 0;
  display: flex; align-items: center; transition: color 0.2s;
}
.close-btn:hover { color: #5D4037; }

.popup-content {
  flex: 1; overflow: hidden; display: flex; flex-direction: column;
}

.popup-title {
  font-size: 1.2rem; font-weight: bold; color: #3E2723; margin: 0 0 6px 0;
  text-align: left;
}

.popup-desc {
  font-size: 0.8rem; color: #5D4037; line-height: 1.5; margin: 0;
  overflow-y: auto; /* 允许内部滚动 */
  scrollbar-width: thin; scrollbar-color: #D7CCC8 transparent;
  padding-right: 4px;
}
.popup-desc::-webkit-scrollbar { width: 3px; }
.popup-desc::-webkit-scrollbar-thumb { background: #D7CCC8; border-radius: 3px; }

.popup-footer {
  margin-top: 10px; display: flex; gap: 8px; justify-content: flex-start;
}
.link-pill {
  font-size: 0.7rem; background: #F5F5F5; color: #5D4037;
  padding: 3px 8px; border-radius: 4px; cursor: pointer;
  display: flex; align-items: center; gap: 2px;
  transition: all 0.2s;
}
.link-pill:hover { background: #3E2723; color: white; }


/* --- 动画效果：原位上浮 (Pop Up) --- */
.pop-up-enter-active,
.pop-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* 带有弹性效果 */
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95); /* 从下方稍微缩小处浮出 */
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

</style>