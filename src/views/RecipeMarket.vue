<template>
  <div class="min-h-screen bg-stone-50 text-stone-800 p-6 pb-24">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">🌿 养生膳食广场</h1>
      <p class="text-stone-500">根据您的体质推荐的精准食疗方案</p>
    </header>

    <div class="flex gap-3 mb-8 overflow-x-auto pb-2">
      <button v-for="tag in ['全部', '湿热质', '气虚质', '安神', '补气']" :key="tag"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="tag === '全部' ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-500'">
        {{ tag }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-20 text-stone-500">⏳ 正在从云端获取食谱...</div>
    <div v-else-if="recipes.length === 0" class="text-center py-20 bg-stone-100 rounded-xl border border-dashed border-stone-300">
      <p class="text-stone-500">暂时还没有食谱，请在数据库添加数据。</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="recipe in recipes" :key="recipe.id" 
        @click="openRecipe(recipe)"
        class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-stone-100 flex flex-col">
        
        <div class="relative h-48 overflow-hidden">
          <img :src="recipe.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute bottom-2 left-2 flex gap-2">
            <span class="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Clock :size="12" /> {{ recipe.time }}
            </span>
          </div>
        </div>

        <div class="p-4 flex-1 flex flex-col">
          <h3 class="text-lg font-bold text-stone-800 mb-2">{{ recipe.name }}</h3>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
              适合: {{ recipe.bodyType }}
            </span>
          </div>
          <p class="text-xs text-stone-400 mt-auto truncate">
            食材: {{ recipe.ingredients.map(i => i.name).join('、') }}
          </p>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="selectedRecipe" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="closeRecipe"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
          <button @click="closeRecipe" class="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
            <X :size="20" />
          </button>

          <div class="h-64 sm:h-80 w-full shrink-0 relative">
             <img :src="selectedRecipe.image" class="w-full h-full object-cover">
             <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-20"></div>
          </div>

          <div class="p-6 sm:p-8 -mt-6 relative z-10">
            <h2 class="text-3xl font-bold text-stone-900 mb-2">{{ selectedRecipe.name }}</h2>
            
            <div v-if="selectedRecipe.contraindications.length" class="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3 mb-6">
              <AlertTriangle class="text-red-500 shrink-0 mt-0.5" :size="18" />
              <div>
                <p class="text-sm font-bold text-red-700">禁忌提醒</p>
                <p class="text-xs text-red-600">慎用：{{ selectedRecipe.contraindications.join('、') }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
               <div class="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span class="text-xs text-stone-400 block mb-1">适宜体质</span>
                  <span class="font-medium text-emerald-700 flex items-center gap-1">
                    <UserCheck :size="14"/> {{ selectedRecipe.bodyType }}
                  </span>
               </div>
               <div class="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span class="text-xs text-stone-400 block mb-1">主要功效</span>
                  <span class="font-medium text-amber-700 flex items-center gap-1">
                    <Sparkles :size="14"/> {{ selectedRecipe.efficacy.join('/') }}
                  </span>
               </div>
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <Soup :size="20" /> 所需食材
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="(ing, idx) in selectedRecipe.ingredients" :key="idx"
                  class="flex items-center justify-between p-2 rounded-lg border transition-colors"
                  :class="ing.isHerb ? 'bg-amber-50 border-amber-200 cursor-pointer hover:bg-amber-100' : 'bg-white border-stone-100'"
                  @click="ing.isHerb ? handleHerbClick(ing) : null"
                >
                  <span :class="ing.isHerb ? 'text-amber-900 font-medium' : 'text-stone-600'">
                    {{ ing.name }}
                    <Leaf v-if="ing.isHerb" :size="12" class="inline ml-1 text-amber-500"/>
                  </span>
                  <span class="text-xs text-stone-400">{{ ing.amount }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><ListOrdered :size="20" /> 烹饪步骤</h3>
              <div class="space-y-6">
                <div v-for="(step, idx) in selectedRecipe.steps" :key="idx" class="flex gap-4">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mt-0.5">{{ idx + 1 }}</div>
                  <p class="text-stone-600 leading-relaxed">{{ step }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router' // 引入 useRoute
import { Clock, UserCheck, Sparkles, AlertTriangle, Leaf, X, Soup, ListOrdered } from 'lucide-vue-next'
import { supabase } from '@/supabaseClient' 

const router = useRouter()
const route = useRoute() // 获取当前路由信息

const recipes = ref([])
const loading = ref(true)
const selectedRecipe = ref(null)

// 1. 打开食谱时，在 URL 里加个记号 (?open_id=xxx)
const openRecipe = (recipe) => {
  selectedRecipe.value = recipe;
  // 修改 URL 但不刷新页面
  router.replace({ query: { ...route.query, open_id: recipe.id } })
};

// 2. 关闭食谱时，去掉记号
const closeRecipe = () => {
  selectedRecipe.value = null;
  router.replace({ query: { ...route.query, open_id: undefined } })
};

// 3. 点击药材跳转 (ByName)
const handleHerbClick = (item) => {
  if (item.isHerb) {
    // 此时 URL 里已经有 ?open_id=xxx 了，所以不用担心，
    // 当你从药材页点“返回”时，URL 还是带 id 的，下面的逻辑会自动重新打开弹窗
    router.push({ name: 'HerbDetail', params: { name: item.name } })
  }
};

const fetchRecipes = async () => {
  try {
    loading.value = true
    let { data, error } = await supabase.from('recipes').select('*')
    if (error) throw error

    if (data) {
      recipes.value = data.map(item => ({
        ...item,
        bodyType: item.body_type, 
        efficacy: item.efficacy || [],
        ingredients: item.ingredients || [],
        steps: item.steps || [],
        contraindications: item.contraindications || []
      }))

      // 4. 【核心逻辑】数据加载完后，检查 URL 里有没有记号
      // 如果发现 URL 里有 open_id，就自动把那个食谱打开
      const pendingId = route.query.open_id
      if (pendingId) {
        const target = recipes.value.find(r => r.id == pendingId)
        if (target) {
          selectedRecipe.value = target
        }
      }
    }
  } catch (error) {
    console.error('获取食谱失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecipes()
})
</script>

<style scoped>
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 20px; }
</style>