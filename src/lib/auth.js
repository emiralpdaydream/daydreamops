import { STORAGE_KEYS } from './storageKeys'

const STORAGE_KEY = STORAGE_KEYS.PASSWORD_HASH

export const MIN_PASSWORD_LENGTH = 4

export function hasPassword() {
  return Boolean(localStorage.getItem(STORAGE_KEY))
}

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function setPassword(password) {
  const hash = await hashPassword(password)
  localStorage.setItem(STORAGE_KEY, hash)
}

export async function verifyPassword(password) {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return false
  const hash = await hashPassword(password)
  return hash === stored
}
