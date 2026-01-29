<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import { useAuth } from '@/composables/useAuth'

// HealthTag / UserHealthProfile 类型见 src/types/health.ts

const { user } = useAuth()

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const newTag = ref('')

const healthProfile = ref({
  active: /** @type {import('@/types/health').HealthTag[]} */ ([]),
  history: [],
})

const canAdd = computed(
  () => !!user.value?.id && !!newTag.value.trim() && !saving.value
)

async function loadHealthTags() {
  if (!user.value?.id) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  const { data, error } = await supabase
    .from('profiles')
    .select('health_tags')
    .eq('id', user.value.id)
    .maybeSingle()

  loading.value = false

  if (error) {
    errorMsg.value = error.message || '加载健康标签失败'
    return
  }

  const raw = data?.health_tags
  if (raw && typeof raw === 'object') {
    healthProfile.value = {
      active: Array.isArray(raw.active) ? raw.active : [],
      history: Array.isArray(raw.history) ? raw.history : [],
    }
  } else {
    healthProfile.value = { active: [], history: [] }
  }
}

onMounted(loadHealthTags)

async function addTag() {
  const name = newTag.value.trim()
  if (!name || !user.value?.id) return

  errorMsg.value = ''

  const tag = {
    name,
    source: 'user_manual',
    added_at: new Date().toISOString(),
  }

  const prev = JSON.parse(JSON.stringify(healthProfile.value))
  healthProfile.value = {
    ...healthProfile.value,
    active: [...healthProfile.value.active, tag],
  }
  newTag.value = ''
  saving.value = true

  const { error } = await supabase.rpc('add_health_tag', {
    new_tag_name: name,
    user_uuid: user.value.id,
  })

  saving.value = false

  if (error) {
    healthProfile.value = prev
    errorMsg.value = error.message || '添加标签失败'
  } else {
    // 可选：重新拉取一次，确保与后端逻辑（如历史归档）保持一致
    await loadHealthTags()
  }
}

async function removeTag(tag) {
  if (!user.value?.id) return

  errorMsg.value = ''

  const prev = JSON.parse(JSON.stringify(healthProfile.value))
  healthProfile.value = {
    ...healthProfile.value,
    active: healthProfile.value.active.filter(
      (t) =>
        !(
          t.name === tag.name &&
          t.source === tag.source &&
          t.added_at === tag.added_at
        )
    ),
  }
  saving.value = true

  const { error } = await supabase.rpc('archive_health_tag', {
    target_tag_name: tag.name,
    user_uuid: user.value.id,
  })

  if (!error) {
    saving.value = false
    await loadHealthTags()
    return
  }

  // 如果 RPC 不存在或失败，尝试直接更新 profiles.health_tags 作为回退方案
  try {
    const nextActive = healthProfile.value.active
    const nextHistory = Array.isArray(prev.history)
      ? [...prev.history, tag]
      : [tag]

    const { error: fallbackError } = await supabase
      .from('profiles')
      .update({
        health_tags: {
          active: nextActive,
          history: nextHistory,
        },
      })
      .eq('id', user.value.id)

    saving.value = false

    if (fallbackError) {
      healthProfile.value = prev
      errorMsg.value = fallbackError.message || error.message || '删除标签失败'
    } else {
      healthProfile.value = {
        active: nextActive,
        history: nextHistory,
      }
    }
  } catch (e) {
    saving.value = false
    healthProfile.value = prev
    errorMsg.value = error.message || '删除标签失败'
  }
}
</script>

<template>
  <section class="mt-8">
    <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
      <h2 class="text-bamboo font-serif font-semibold text-base mb-3 flex items-center gap-2">
        <span class="w-1 h-4 bg-bamboo rounded" /> 健康体质标签
      </h2>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center gap-3 text-sandalwood/60 text-sm">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-sandalwood" />
        <span>正在整理您的体质标签...</span>
      </div>

      <template v-else>
        <!-- 标签云 -->
        <div v-if="healthProfile.active.length" class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="tag in healthProfile.active"
            :key="`${tag.name}-${tag.added_at}`"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors"
            :class="tag.source === 'ai_inferred'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'"
            @click="removeTag(tag)"
          >
            <span>{{ tag.name }}</span>
            <span class="text-[10px] opacity-70">
              {{ tag.source === 'ai_inferred' ? 'AI' : '手动' }}
            </span>
            <span class="ml-1 text-sandalwood/60 hover:text-sandalwood text-[10px]">✕</span>
          </button>
        </div>
        <p v-else class="text-xs text-sandalwood/50 mb-4">
          暂无体质标签，先从“胃寒”“湿气重”等开始记录吧。
        </p>

        <!-- 添加区 -->
        <form class="flex gap-2" @submit.prevent="addTag">
          <input
            v-model="newTag"
            type="text"
            class="flex-1 px-3 py-2 rounded-lg border border-sandalwood/20 bg-white text-sandalwood text-sm placeholder-sandalwood/40 focus:outline-none focus:ring-2 focus:ring-sandalwood/20"
            placeholder="输入新的体质标签，如“胃寒”、“湿气重”"
          />
          <button
            type="submit"
            class="px-3 py-2 rounded-lg bg-sandalwood text-white text-sm font-medium hover:bg-sandalwood/90 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!canAdd"
          >
            添加
          </button>
        </form>

        <p v-if="errorMsg" class="mt-2 text-xs text-cinnabar">
          {{ errorMsg }}
        </p>
      </template>
    </div>
  </section>
</template>

