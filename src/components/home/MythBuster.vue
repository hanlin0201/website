<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { HelpCircle, CheckCircle2, XCircle, RotateCw, Loader2 } from 'lucide-vue-next'

// --- 1. 配置 Supabase ---
const SUPABASE_URL = 'https://htrtcaswqydnfvgwernh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnRjYXN3cXlkbmZ2Z3dlcm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDYyNDgsImV4cCI6MjA4NTE4MjI0OH0.N9NEwFKZHtiEITimRsaMEQ4hS-rZ2XdR2pLWSG4GC68'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// --- 2. 状态管理 ---
const myths = ref([])          // 当前显示的3条数据
const loading = ref(false)     // 加载状态
const expandedId = ref(null)   // 当前展开的ID
const bgImage = "https://bpic.588ku.com/back_list_pic/25/01/23/ec0cb9c263b689042869b689494b650e.jpg!/fw/350/quality/95/unsharp/true/compress/true"

// --- 3. 核心功能：换一批 ---
async function fetchRandomMyths() {
  loading.value = true
  expandedId.value = null // 换批次时收起所有详情
  
  try {
    // 调用我们在数据库里写的 get_random_myths 函数
    const { data, error } = await supabase.rpc('get_random_myths')
    
    if (error) throw error
    
    // 如果数据库没数据，就给点默认的防止留白
    if (!data || data.length === 0) {
       console.warn("数据库没数据，显示默认兜底数据")
       // 这里可以放之前的静态数组作为兜底
    } else {
       myths.value = data
    }
  } catch (error) {
    console.error('获取数据失败:', error.message)
    // 实际项目中这里可以加个 Toast 提示
  } finally {
    // 延迟一点点让动画更自然
    setTimeout(() => { loading.value = false }, 500)
  }
}

// 展开/收起逻辑
function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// 初始化加载
onMounted(() => {
  fetchRandomMyths()
})
</script>

<template>
  <section class="myth-buster-screen" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="bg-overlay"></div>

    <div class="content-wrapper">
      <div class="section-header">
        <div class="title-group">
          <h3 class="title">养生避雷针</h3>
          <span class="subtitle">粉碎谣言 · 正本清源</span>
        </div>
        
        <button 
          class="refresh-btn" 
          @click="fetchRandomMyths" 
          :disabled="loading"
          title="换一批知识"
        >
          <RotateCw :class="{ 'spin-anim': loading }" />
          <span class="btn-text">换一批</span>
        </button>
      </div>

      <div class="myth-list">
        
        <div v-if="loading" class="loading-state">
           <Loader2 class="w-8 h-8 animate-spin text-brown-600" />
           <p>正在搜罗养生秘籍...</p>
        </div>

        <div 
          v-else
          v-for="item in myths" 
          :key="item.id" 
          class="myth-item"
          :class="{ 'is-expanded': expandedId === item.id }"
          @click="toggle(item.id)"
        >
          <div class="myth-question">
            <span class="emoji-icon">{{ item.emoji || '❓' }}</span>
            <span class="q-text">{{ item.question }}</span>
            
            <span class="indicator">
              {{ expandedId === item.id ? '收起' : '点击揭秘' }}
            </span>
          </div>

          <div v-show="expandedId === item.id" class="myth-answer animate-slide-down">
            <div class="answer-badge">
              <XCircle v-if="item.type === 'danger'" class="icon-bad" />
              <CheckCircle2 v-else-if="item.type === 'safe'" class="icon-good" />
              <HelpCircle v-else class="icon-warn" />
              
              <span 
                class="answer-text"
                :class="{
                  'text-red': item.type === 'danger',
                  'text-green': item.type === 'safe',
                  'text-orange': item.type === 'warning'
                }"
              >{{ item.answer_text }}</span>
            </div>
            
            <p class="detail" v-html="item.detail"></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 保持原有的大气布局 */
.myth-buster-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  scroll-snap-align: start; 
  scroll-snap-stop: always;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4); /* 稍微加深一点点遮罩让文字更清晰 */
  z-index: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  padding: 40px;
  /* 保持毛玻璃 */
  background: rgba(255, 255, 255, 0.92); 
  backdrop-filter: blur(16px);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.6);
  max-height: 85vh;
  overflow-y: auto;
}

/* 头部优化：Flex布局让按钮在右边 */
.section-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; /* 底部对齐 */
  margin-bottom: 30px; 
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 15px;
}
.title { font-size: 2rem; color: #5D4037; font-weight: bold; margin: 0; font-family: 'Noto Serif SC', serif;}
.subtitle { font-size: 0.9rem; color: #8B5E3C; letter-spacing: 2px; display: block; margin-top: 5px; }

/* 换一批按钮 */
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  color: #5D4037;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.refresh-btn:hover { background: #fdfdfd; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.refresh-btn:active { transform: translateY(0); }
.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 列表与卡片 */
.myth-list { display: flex; flex-direction: column; gap: 16px; min-height: 300px; /* 防止内容加载时抖动 */ }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 200px; color: #8B5E3C; gap: 10px;
}

.myth-item {
  background: white; 
  border-radius: 12px; 
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02); 
  border: 1px solid rgba(139, 94, 60, 0.1);
  transition: all 0.3s ease; 
  cursor: pointer;
}
.myth-item:hover { transform: translateY(-2px); border-color: #C44D36; }

.myth-question {
  padding: 20px 24px; 
  display: flex; align-items: center; gap: 12px;
  font-size: 1.1rem; color: #2c2c2c; font-weight: 500;
}
.emoji-icon { font-size: 1.4rem; }
.q-text { flex: 1; }
.indicator { font-size: 0.8rem; color: #999; background: #f0f0f0; padding: 4px 10px; border-radius: 12px; }

.myth-answer {
  background: #FFF9F7; /* 极淡的暖色底 */
  padding: 15px 24px 24px 24px; 
  border-top: 1px dashed rgba(196, 77, 54, 0.15);
}

.answer-badge { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-weight: bold; font-size: 1.1rem; }
.text-red { color: #d32f2f; }
.text-green { color: #2e7d32; }
.text-orange { color: #ed6c02; }
.icon-bad { color: #d32f2f; width: 20px; }
.icon-good { color: #2e7d32; width: 20px; }
.icon-warn { color: #ed6c02; width: 20px; }

.detail { font-size: 1rem; color: #4e342e; line-height: 1.8; }

/* 动画 */
.animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* --- 重点高亮样式 (必须使用 :deep 因为是 v-html 渲染的内容) --- */
:deep(.hl) {
  color: #C44D36; /* 砖红色高亮 */
  font-weight: bold;
  background: rgba(196, 77, 54, 0.08);
  padding: 0 4px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .content-wrapper { padding: 20px; width: 95%; }
  .title { font-size: 1.5rem; }
  .refresh-btn .btn-text { display: none; } /* 手机上只显示图标 */
  .refresh-btn { padding: 8px; border-radius: 50%; }
}
</style>