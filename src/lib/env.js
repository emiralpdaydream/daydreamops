/**
 * Ortam değişkenleri (Vite — yalnızca VITE_ öneki tarayıcıda görünür).
 * OPENAI_API_KEY asla burada okunmaz; sadece dev proxy kullanır.
 */
export const OPENAI_ENABLED =
  import.meta.env.VITE_OPENAI_ENABLED === 'true'

export const OPENAI_MODEL =
  import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'
