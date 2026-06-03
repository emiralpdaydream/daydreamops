/** OPENAI_API_KEY varlık kontrolü — değer asla dönmez. */
export function handleOpenAiTest() {
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim())
  if (hasKey) {
    return {
      status: 200,
      body: { ok: true, message: 'OpenAI bağlantısı aktif.' },
    }
  }
  return {
    status: 200,
    body: { ok: false, message: 'OPENAI_API_KEY bulunamadı.' },
  }
}
