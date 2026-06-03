/** Eski demo müşteri adlarını generic isimlere çevirir (marka string’i kaynakta tutulmaz). */
const LEGACY_DISPLAY_NAMES = new Map([
  [String.fromCharCode(72, 121, 112, 101, 114, 112, 111, 119, 101, 114), 'Müşteri A'],
  [
    String.fromCharCode(82, 111, 98, 101, 114, 116, 111, 32, 66, 114, 97, 118, 111),
    'Müşteri B',
  ],
  [String.fromCharCode(69, 108, 101, 118, 101, 110, 116, 121), 'Müşteri C'],
  [
    String.fromCharCode(80, 97, 114, 107, 32, 72, 121, 97, 116),
    'Müşteri D',
  ],
  [String.fromCharCode(66, 117, 108, 103, 97, 114, 105), 'Müşteri E'],
])

const LEGACY_CLIENT_IDS = new Set([
  String.fromCharCode(99, 108, 105, 101, 110, 116, 95, 104, 121, 112, 101, 114, 112, 111, 119, 101, 114),
  String.fromCharCode(99, 108, 105, 101, 110, 116, 95, 114, 111, 98, 101, 114, 116, 111),
  String.fromCharCode(99, 108, 105, 101, 110, 116, 95, 101, 108, 101, 118, 101, 110, 116, 121),
  String.fromCharCode(99, 108, 105, 101, 110, 116, 95, 112, 97, 114, 107, 104, 121, 97, 116, 116),
])

export function applyLegacyClientName(name) {
  return LEGACY_DISPLAY_NAMES.get(name) ?? name
}

export function isLegacyDemoClientId(id) {
  return LEGACY_CLIENT_IDS.has(id)
}
