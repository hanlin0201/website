/**
 * useHerbData - 药材数据组合式函数
 * 模拟 Redis 缓存逻辑：优先从 localStorage 读取，过期或不存在时从 API 获取并写入
 */

import { ref, computed } from 'vue'
import { fetchHerbsFromApi, fetchHerbByIdFromApi, CACHE_KEY, CACHE_TTL_MS } from '@/api/herbs'

/**
 * 获取药材列表（带 localStorage 缓存）
 * @returns {{ herbs: Ref<Array>, loading: Ref<boolean>, error: Ref<Error|null>, refresh: Function }}
 */
export function useHerbList() {
  const herbs = ref([])
  const loading = ref(false)
  const error = ref(null)

  function getCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const { data, timestamp } = JSON.parse(raw)
      if (Date.now() - timestamp > CACHE_TTL_MS) return null
      return data
    } catch {
      return null
    }
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('useHerbData: setCache failed', e)
    }
  }

  async function load() {
    const cached = getCache()
    if (cached && Array.isArray(cached) && cached.length > 0) {
      herbs.value = cached
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await fetchHerbsFromApi()
      herbs.value = data
      setCache(data)
    } catch (e) {
      error.value = e
      herbs.value = []
    } finally {
      loading.value = false
    }
  }

  return { herbs, loading, error, refresh: load, load }
}

/** 单条药材缓存 key 前缀 */
const HERB_DETAIL_PREFIX = 'herb_detail_'

/**
 * 获取单个药材详情（带 localStorage 缓存）
 * @param {Ref<number|string>|number|string} id
 * @returns {{ herb: Ref<Object|null>, loading: Ref<boolean>, error: Ref<Error|null>, load: Function }}
 */
export function useHerbDetail(id) {
  const herb = ref(null)
  const loading = ref(false)
  const error = ref(null)

  function cacheKey(idVal) {
    return `${HERB_DETAIL_PREFIX}${idVal}`
  }

  function getCache(idVal) {
    try {
      const raw = localStorage.getItem(cacheKey(idVal))
      if (!raw) return null
      const { data, timestamp } = JSON.parse(raw)
      if (Date.now() - timestamp > CACHE_TTL_MS) return null
      return data
    } catch {
      return null
    }
  }

  function setCache(idVal, data) {
    try {
      localStorage.setItem(cacheKey(idVal), JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('useHerbData: setCache detail failed', e)
    }
  }

  async function load(idVal) {
    const v = idVal ?? (typeof id === 'object' && id?.value != null ? id.value : id)
    if (v == null || v === '') {
      herb.value = null
      return
    }
    const cached = getCache(v)
    if (cached) {
      herb.value = cached
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await fetchHerbByIdFromApi(v)
      herb.value = data
      if (data) setCache(v, data)
    } catch (e) {
      error.value = e
      herb.value = null
    } finally {
      loading.value = false
    }
  }

  return { herb, loading, error, load }
}
