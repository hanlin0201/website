/**
 * 认证与用户历史埋点模块（auth.js）
 * - 登录/注册逻辑
 * - user_history 静默写入（仅已登录用户）
 * 注意：user / profile / 门禁状态在 useAuth 中维护，此处仅纯逻辑。
 */

import { supabase } from '@/supabaseClient'

/**
 * 先尝试登录，失败则尝试注册（兼容旧用法）
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, user?: object, error?: import('@supabase/supabase-js').AuthError }}
 */
export async function loginOrRegister(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error) return { ok: true, user: data.user }
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
  if (!signUpError) return { ok: true, user: signUpData.user }
  return { ok: false, error: signUpError }
}

/** 登录 */
export async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { ok: !error, user: data?.user, error }
}

/** 注册 */
export async function handleRegister(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { ok: !error, user: data?.user, error }
}

/**
 * 隐形埋点：将用户提问写入 user_history（仅当 user 存在时调用）
 * 需在 Supabase 建表，例如：
 *   create table user_history (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) not null,
 *     content text not null,
 *     created_at timestamptz default now()
 *   );
 * 并配置 RLS：允许用户 insert 自己的行。
 *
 * @param {string} userId - auth.users.id
 * @param {string} content - 用户发送的消息内容
 */
export async function logUserHistory(userId, content) {
  if (!userId || !content?.trim()) return
  const { error } = await supabase.from('user_history').insert({
    user_id: userId,
    content: content.trim(),
  })
  if (error) {
    // 静默失败，不影响聊天流程（如表不存在或 RLS 拒绝）
  }
}
