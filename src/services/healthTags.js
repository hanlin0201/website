/**
 * 健康标签类型定义（仅类型说明，运行时代码仍为 JS）
 *
 * interface HealthTag {
 *   name: string;      // 标签名，如 "胃寒"
 *   source: string;    // 来源，如 "user_manual" 或 "ai_inferred"
 *   added_at: string;  // 添加时间 ISO 字符串
 * }
 *
 * interface UserHealthProfile {
 *   active: HealthTag[];  // 当前生效的标签
 *   history: any[];       // 历史归档（前端暂时只读不展示）
 * }
 */

import { supabase } from '@/supabaseClient'

/**
 * 获取用户在 profiles.health_tags 中存储的健康标签
 * @param {string} userId
 * @returns {Promise<{ active: import('../services/healthTags').HealthTag[]; history: any[] }>}
 */
export async function fetchUserHealthProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('health_tags')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  const raw = data?.health_tags || {}
  const active = Array.isArray(raw.active) ? raw.active : []
  const history = Array.isArray(raw.history) ? raw.history : []

  return { active, history }
}

/**
 * 调用 Supabase RPC：add_health_tag(new_tag_name, user_uuid)
 * 后端负责写入 profiles.health_tags.active
 * @param {string} name
 * @param {string} userId
 */
export async function addHealthTag(name, userId) {
  const { error } = await supabase.rpc('add_health_tag', {
    new_tag_name: name,
    user_uuid: userId,
  })
  if (error) throw error
}

/**
 * 调用 Supabase RPC：archive_health_tag(target_tag_name, user_uuid)
 * 后端负责将标签从 active 移至 history
 * @param {string} name
 * @param {string} userId
 */
export async function archiveHealthTag(name, userId) {
  const { error } = await supabase.rpc('archive_health_tag', {
    target_tag_name: name,
    user_uuid: userId,
  })
  if (error) throw error
}

