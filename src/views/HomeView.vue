<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import HerbCard from '@/components/HerbCard.vue'
import { useHerbList } from '@/composables/useHerbData'

// 药材类别标签
const CATEGORY_TAGS = ['全部', '根茎类', '果实/种子类', '全草类', '花类', '藤木类', '动物类', '枝叶/树皮类', '菌藻类', '矿物类', '其他']

// 首字母标签 A-Z
const LETTER_TAGS = ['全部', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z']

// 中文汉字拼音首字母映射表（常用汉字）
const pinyinMap = {
  '阿': 'A', '艾': 'A', '安': 'A', '氨': 'A', '鞍': 'A', '矮': 'A',
  '巴': 'B', '白': 'B', '百': 'B', '柏': 'B', '班': 'B', '板': 'B', '半': 'B', '斑': 'B', '薄': 'B', '豹': 'B', '贝': 'B', '北': 'B', '蓖': 'B', '荸': 'B', '荜': 'B', '萆': 'B', '篦': 'B', '鳖': 'B', '槟': 'B', '冰': 'B', '菠': 'B', '补': 'B', '布': 'B', '扁': 'B', '鞭': 'B', '八': 'B', '蚌': 'B',
  '蚕': 'C', '苍': 'C', '草': 'C', '茶': 'C', '柴': 'C', '蝉': 'C', '菖': 'C', '常': 'C', '长': 'C', '车': 'C', '陈': 'C', '沉': 'C', '穿': 'C', '川': 'C', '椿': 'C', '刺': 'C', '葱': 'C', '丛': 'C', '赤': 'C', '重': 'C', '臭': 'C', '楮': 'C', '蟾': 'C', '侧': 'C', '苁': 'C', '蔟': 'C',
  '大': 'D', '丹': 'D', '淡': 'D', '当': 'D', '党': 'D', '刀': 'D', '倒': 'D', '地': 'D', '滴': 'D', '点': 'D', '冬': 'D', '豆': 'D', '独': 'D', '杜': 'D', '断': 'D', '对': 'D', '多': 'D', '代': 'D', '玳': 'D', '胆': 'D', '灯': 'D', '丁': 'D', '东': 'D', '蝶': 'D',
  '鹅': 'E', '莪': 'E', '阿': 'E', '儿': 'E',
  '番': 'F', '矾': 'F', '防': 'F', '飞': 'F', '榧': 'F', '肥': 'F', '粉': 'F', '凤': 'F', '蜂': 'F', '佛': 'F', '茯': 'F', '附': 'F', '腹': 'F', '复': 'F', '覆': 'F', '浮': 'F', '蝮': 'F',
  '甘': 'G', '干': 'G', '橄': 'G', '高': 'G', '藁': 'G', '葛': 'G', '蛤': 'G', '钩': 'G', '枸': 'G', '狗': 'G', '谷': 'G', '骨': 'G', '瓜': 'G', '关': 'G', '鳜': 'G', '龟': 'G', '桂': 'G', '归': 'G', '广': 'G', '贯': 'G', '光': 'G',
  '海': 'H', '含': 'H', '寒': 'H', '旱': 'H', '蒿': 'H', '禾': 'H', '合': 'H', '何': 'H', '鹤': 'H', '黑': 'H', '红': 'H', '猴': 'H', '厚': 'H', '胡': 'H', '虎': 'H', '花': 'H', '化': 'H', '槐': 'H', '黄': 'H', '茴': 'H', '蕙': 'H', '火': 'H', '藿': 'H', '蛔': 'H', '怀': 'H', '欢': 'H', '滑': 'H', '琥': 'H', '珀': 'H',
  '鸡': 'J', '积': 'J', '急': 'J', '棘': 'J', '蒺': 'J', '绞': 'J', '藜': 'L', '姜': 'J', '僵': 'J', '降': 'J', '蕉': 'J', '椒': 'J', '角': 'J', '接': 'J', '芥': 'J', '金': 'J', '筋': 'J', '荆': 'J', '井': 'J', '景': 'J', '韭': 'J', '菊': 'J', '橘': 'J', '巨': 'J', '卷': 'J', '决': 'J', '蕨': 'J', '九': 'J', '桔': 'J', '蚧': 'J', '芨': 'J',
  '开': 'K', '苦': 'K', '款': 'K', '宽': 'K', '昆': 'K', '苦': 'K', '孔': 'K', '空': 'K',
  '拉': 'L', '辣': 'L', '蜡': 'L', '莱': 'L', '兰': 'L', '蓝': 'L', '狼': 'L', '郎': 'L', '榔': 'L', '雷': 'L', '肋': 'L', '梨': 'L', '藜': 'L', '李': 'L', '理': 'L', '鲤': 'L', '连': 'L', '莲': 'L', '帘': 'L', '廉': 'L', '凉': 'L', '两': 'L', '灵': 'L', '苓': 'L', '羚': 'L', '菱': 'L', '陵': 'L', '零': 'L', '凌': 'L', '刘': 'L', '留': 'L', '龙': 'L', '漏': 'L', '芦': 'L', '卢': 'L', '炉': 'L', '鹿': 'L', '路': 'L', '露': 'L', '绿': 'L', '罗': 'L', '络': 'L', '骆': 'L', '落': 'L', '驴': 'L', '榈': 'L', '律': 'L',
  '麻': 'M', '马': 'M', '玛': 'M', '蚂': 'M', '麦': 'M', '满': 'M', '蔓': 'M', '芒': 'M', '猫': 'M', '茅': 'M', '没': 'M', '玫': 'M', '梅': 'M', '蒙': 'M', '檬': 'M', '猕': 'M', '米': 'M', '秘': 'M', '蜜': 'M', '眠': 'M', '绵': 'M', '明': 'M', '蘑': 'M', '磨': 'M', '墨': 'M', '茉': 'M', '牡': 'M', '木': 'M', '母': 'M', '毛': 'M', '茂': 'M',
  '南': 'N', '楠': 'N', '脑': 'N', '闹': 'N', '牛': 'N', '女': 'N', '暖': 'N', '糯': 'N',
  '藕': 'O',
  '爬': 'P', '盘': 'P', '胖': 'P', '炮': 'P', '泡': 'P', '佩': 'P', '枇': 'P', '啤': 'P', '皮': 'P', '片': 'P', '漂': 'P', '苹': 'P', '葡': 'P', '蒲': 'P', '蒱': 'P', '朴': 'P', '蒱': 'P',
  '漆': 'Q', '齐': 'Q', '芪': 'Q', '脐': 'Q', '蕲': 'Q', '蛴': 'Q', '芡': 'Q', '前': 'Q', '羌': 'Q', '强': 'Q', '茄': 'Q', '秦': 'Q', '芹': 'Q', '青': 'Q', '氢': 'Q', '清': 'Q', '全': 'Q', '犬': 'Q', '雀': 'Q', '鹊': 'Q', '榷': 'Q', '千': 'Q', '乾': 'Q', '仟': 'Q', '茜': 'Q', '蜻': 'Q', '蜣': 'Q',
  '人': 'R', '忍': 'R', '刃': 'R', '认': 'R', '日': 'R', '绒': 'R', '肉': 'R', '乳': 'R', '软': 'R', '瑞': 'R', '蕊': 'R',
  '三': 'S', '伞': 'S', '桑': 'S', '丧': 'S', '扫': 'S', '沙': 'S', '砂': 'S', '山': 'S', '珊': 'S', '芍': 'S', '蛇': 'S', '麝': 'S', '射': 'S', '伸': 'S', '神': 'S', '肾': 'S', '升': 'S', '生': 'S', '石': 'S', '食': 'S', '使': 'S', '柿': 'S', '首': 'S', '瘦': 'S', '熟': 'S', '薯': 'S', '蜀': 'S', '树': 'S', '栓': 'S', '水': 'S', '司': 'S', '丝': 'S', '四': 'S', '松': 'S', '酸': 'S', '蒜': 'S', '苏': 'S', '素': 'S', '锁': 'S', '缩': 'S', '羧': 'S', '髓': 'S',
  '台': 'T', '太': 'T', '檀': 'T', '炭': 'T', '碳': 'T', '桃': 'T', '陶': 'T', '藤': 'T', '天': 'T', '田': 'T', '甜': 'T', '通': 'T', '桐': 'T', '铜': 'T', '土': 'T', '菟': 'T', '兔': 'T', '槌': 'T', '透': 'T',
  '瓦': 'W', '菀': 'W', '万': 'W', '望': 'W', '王': 'W', '威': 'W', '乌': 'W', '无': 'W', '芜': 'W', '吴': 'W', '五': 'W', '梧': 'W', '蜈': 'W', '武': 'W', '舞': 'W', '蜿': 'W',
  '西': 'X', '溪': 'X', '犀': 'X', '锡': 'X', '蟋': 'X', '洗': 'X', '细': 'X', '虾': 'X', '仙': 'X', '先': 'X', '纤': 'X', '苋': 'X', '香': 'X', '相': 'X', '箱': 'X', '湘': 'X', '小': 'X', '硝': 'X', '血': 'X', '薤': 'X', '辛': 'X', '杏': 'X', '雄': 'X', '熊': 'X', '休': 'X', '绣': 'X', '须': 'X', '徐': 'X', '旋': 'X', '玄': 'X', '悬': 'X', '续': 'X', '絮': 'X', '婿': 'X',
  '鸦': 'Y', '鸭': 'Y', '雅': 'Y', '亚': 'Y', '牙': 'Y', '芽': 'Y', '岩': 'Y', '岩': 'Y', '盐': 'Y', '颜': 'Y', '研': 'Y', '延': 'Y', '眼': 'Y', '羊': 'Y', '阳': 'Y', '洋': 'Y', '杨': 'Y', '扬': 'Y', '养': 'Y', '氧': 'Y', '腰': 'Y', '药': 'Y', '野': 'Y', '夜': 'Y', '叶': 'Y', '一': 'Y', '伊': 'Y', '医': 'Y', '衣': 'Y', '蚁': 'Y', '乙': 'Y', '益': 'Y', '茵': 'Y', '因': 'Y', '银': 'Y', '淫': 'Y', '樱': 'Y', '婴': 'Y', '鹦': 'Y', '油': 'Y', '柚': 'Y', '有': 'Y', '柔': 'R', '榆': 'Y', '余': 'Y', '鱼': 'Y', '玉': 'Y', '郁': 'Y', '芋': 'Y', '蜈': 'Y', '域': 'Y', '远': 'Y', '圆': 'Y', '原': 'Y', '元': 'Y', '月': 'Y', '云': 'Y', '芸': 'Y',
  '藻': 'Z', '皂': 'Z', '泽': 'Z', '贼': 'Z', '樟': 'Z', '章': 'Z', '蟑': 'Z', '芝': 'Z', '知': 'Z', '栀': 'Z', '脂': 'Z', '蛭': 'Z', '止': 'Z', '芷': 'Z', '枳': 'Z', '炙': 'Z', '竹': 'Z', '猪': 'Z', '茱': 'Z', '珠': 'Z', '诸': 'Z', '朱': 'Z', '紫': 'Z', '子': 'Z', '自': 'Z', '棕': 'Z', '纵': 'Z', '卒': 'Z', '组': 'Z', '钻': 'Z', '醉': 'Z', '尊': 'Z', '蕨': 'J', '浙': 'Z', '鸩': 'Z', '针': 'Z', '珍': 'Z', '振': 'Z', '蒸': 'Z', '正': 'Z', '钟': 'Z', '肿': 'Z', '种': 'Z', '重': 'Z', '州': 'Z', '周': 'Z', '株': 'Z', '蛛': 'Z', '主': 'Z', '煮': 'Z', '助': 'Z', '注': 'Z', '柱': 'Z', '赭': 'Z'
}

// 获取中文名首字母
function getFirstLetter(name) {
  if (!name) return '#'
  const firstChar = name.charAt(0)
  // 如果是英文字母，直接返回大写
  if (/[A-Za-z]/.test(firstChar)) {
    return firstChar.toUpperCase()
  }
  // 查找拼音映射
  return pinyinMap[firstChar] || '#'
}

const { herbs, loading, error, load, loadMore, hasMore, loadingMore } = useHerbList()
const keyword = ref('')
const activeTag = ref('全部')
const filterMode = ref('category') // 'category' 或 'letter'
const sentinelRef = ref(null)
let _observer = null

// 当前使用的标签列表
const currentTags = computed(() => {
  return filterMode.value === 'category' ? CATEGORY_TAGS : LETTER_TAGS
})

const filteredHerbs = computed(() => {
  let list = herbs.value
  // 关键词搜索
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(h =>
      (h.name || '').toLowerCase().includes(k) ||
      (h.alias || '').toLowerCase().includes(k) ||
      (h.classification || '').toLowerCase().includes(k) ||
      (h.effect || '').toLowerCase().includes(k)
    )
  }
  // 标签过滤
  if (activeTag.value !== '全部') {
    if (filterMode.value === 'category') {
      // 按药材类别过滤
      list = list.filter(h => (h.classification || '').includes(activeTag.value))
    } else {
      // 按首字母过滤
      list = list.filter(h => getFirstLetter(h.name) === activeTag.value)
    }
  }
  return list
})

// 切换分类模式时重置选中标签
function switchFilterMode(mode) {
  filterMode.value = mode
  activeTag.value = '全部'
}

onMounted(() => {
  load()
  _observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return
      if (hasMore.value && !loadingMore.value) loadMore()
    },
    { rootMargin: '100px' }
  )
  watch(
    [() => sentinelRef.value, loading],
    ([el, ld]) => {
      if (el && !ld) _observer?.observe(el)
    },
    { flush: 'post', immediate: true }
  )
})
onUnmounted(() => {
  _observer?.disconnect()
})
</script>

<template>
  <div class="min-h-screen pb-24">
    <!-- 吸顶搜索栏：玻璃拟态 + 木纹覆盖 -->
    <header class="sticky top-0 z-20 glass-search wood-overlay px-4 py-3">
      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sandalwood/60" />
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索药材名称、别名或功效…"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sandalwood/20 bg-white/80 text-sandalwood placeholder-sandalwood/50 focus:outline-none focus:ring-2 focus:ring-sandalwood/30 focus:border-sandalwood/40"
          />
        </div>
      </div>

      <!-- 分类模式切换 -->
      <div class="mt-3 flex items-center gap-3">
        <div class="flex bg-sandalwood/10 rounded-lg p-0.5">
          <button
            type="button"
            :class="[
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              filterMode === 'category'
                ? 'bg-white text-sandalwood shadow-sm'
                : 'text-sandalwood/70 hover:text-sandalwood'
            ]"
            @click="switchFilterMode('category')"
          >
            按类别
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              filterMode === 'letter'
                ? 'bg-white text-sandalwood shadow-sm'
                : 'text-sandalwood/70 hover:text-sandalwood'
            ]"
            @click="switchFilterMode('letter')"
          >
            按首字母
          </button>
        </div>
        <span class="text-xs text-sandalwood/50">
          {{ filterMode === 'category' ? '药材分类' : 'A-Z 索引' }}
        </span>
      </div>

      <!-- 横向滚动胶囊标签 -->
      <div class="mt-2 -mx-4 overflow-x-auto scrollbar-hide">
        <div class="flex gap-2 px-4 min-w-max">
          <button
            v-for="tag in currentTags"
            :key="tag"
            type="button"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTag === tag
                ? 'bg-sandalwood text-white'
                : 'bg-sandalwood/10 text-sandalwood hover:bg-sandalwood/20',
              filterMode === 'letter' && tag !== '全部' ? 'px-3' : ''
            ]"
            @click="activeTag = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- 加载与错误 -->
      <div v-if="loading" class="text-center py-16 text-sandalwood/70">加载中…</div>
      <div v-else-if="error" class="text-center py-16 text-cinnabar">加载失败，请重试</div>

      <!-- 瀑布流：手机 2 列，桌面 4 列 -->
      <div v-else class="masonry-columns">
        <div
          v-for="herb in filteredHerbs"
          :key="herb.id"
          class="masonry-item"
        >
          <HerbCard :herb="herb" />
        </div>
      </div>

      <!-- 加载更多 sentinel + 底部 loading（有列表时才展示） -->
      <div v-if="!loading && !error && filteredHerbs.length > 0" class="flex flex-col items-center gap-2 py-6">
        <div ref="sentinelRef" class="h-1 w-full" aria-hidden="true" />
        <div v-if="loadingMore" class="text-sandalwood/60 text-sm">加载更多…</div>
        <div v-else-if="!hasMore" class="text-sandalwood/50 text-sm">已经到底了</div>
      </div>

      <div
        v-if="!loading && !error && filteredHerbs.length === 0"
        class="text-center py-16 text-sandalwood/60"
      >
        暂无匹配的药材
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* 瀑布流：列布局，手机 2 列，桌面 4 列 */
.masonry-columns {
  column-count: 2;
  column-gap: 1rem;
}
@media (min-width: 768px) {
  .masonry-columns {
    column-count: 4;
  }
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
</style>
