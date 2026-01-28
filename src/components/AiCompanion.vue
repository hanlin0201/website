<script setup>
import { ref, nextTick } from 'vue'
import { ScrollText, Send, X } from 'lucide-vue-next'

const open = ref(false)
const input = ref('')
const messages = ref([
  { role: 'assistant', content: '您好，我是 AI 养生导师。您可以告诉我近来的身体不适或想调理的方向，我会从中医角度为您提供建议。' },
])

function toggle() {
  open.value = !open.value
}

function send() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  // 模拟 AI 回复
  const reply = '从中医角度，您描述的情况需要结合体质与四诊综合判断。建议：一、规律作息，避免熬夜；二、饮食清淡，少食生冷；三、可适当选用药食同源之品调理。若不适持续，请及时就医。'
  setTimeout(() => {
    messages.value.push({ role: 'assistant', content: reply })
  }, 600)
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <!-- 悬浮按钮：卷轴/导师风格 -->
  <button
    type="button"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-sandalwood text-white shadow-card hover:bg-sandalwood/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
    aria-label="AI 养生导师"
    @click="toggle"
  >
    <ScrollText class="w-7 h-7" />
  </button>

  <!-- 聊天窗口：悬浮窗，古代信笺风格 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-show="open"
        class="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[70vh] rounded-xl shadow-card border border-sandalwood/20 overflow-hidden flex flex-col bg-[#FDFBF7]"
      >
        <!-- 标题 -->
        <div class="px-4 py-3 border-b border-sandalwood/15 flex items-center justify-between bg-[#FBF8F2]">
          <h3 class="font-serif font-semibold text-sandalwood">AI 养生导师</h3>
          <button
            type="button"
            class="p-1 rounded text-sandalwood/70 hover:bg-sandalwood/10 hover:text-sandalwood"
            @click="open = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 消息区：信笺淡黄背景 -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF6ED]">
          <div
            v-for="(m, i) in messages"
            :key="i"
            :class="[
              'max-w-[85%] rounded-lg px-4 py-2.5 text-sm',
              m.role === 'user'
                ? 'ml-auto bg-sandalwood/15 text-sandalwood border border-sandalwood/20'
                : 'mr-auto bg-[#F5EDD8] text-sandalwood/95 border border-amber-200/60 shadow-sm'
            ]"
          >
            {{ m.content }}
          </div>
        </div>

        <!-- 输入 -->
        <div class="p-3 border-t border-sandalwood/15 bg-[#FDFBF7]">
          <div class="flex gap-2">
            <input
              v-model="input"
              type="text"
              placeholder="输入您的不适或养生问题…"
              class="flex-1 px-4 py-2 rounded-lg border border-sandalwood/20 bg-white text-sandalwood placeholder-sandalwood/50 focus:outline-none focus:ring-2 focus:ring-sandalwood/30"
              @keydown="handleKeydown"
            />
            <button
              type="button"
              class="p-2 rounded-lg bg-sandalwood text-white hover:bg-sandalwood/90"
              @click="send"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
