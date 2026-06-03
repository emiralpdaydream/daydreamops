/**
 * Tüm localStorage anahtarları — tek yerden, çakışma önlenir.
 * Önek: daydream_ops_
 */
export const STORAGE_KEYS = {
  /** Uygulama verisi: müşteri, brief, teklif, ödeme */
  DATA: 'daydream_ops_data',
  /** Giriş şifresi (hash) */
  PASSWORD_HASH: 'daydream_ops_password_hash',
}

/** Oturum (sekme kapanınca silinir) — sessionStorage */
export const SESSION_KEYS = {
  AUTH: 'daydream_ops_session',
  SPLASH: 'daydream_ops_splash',
}
