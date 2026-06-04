import { useState } from 'react'
import ConfirmModal from '../ConfirmModal'
import { DELETE_CONFIRM_MESSAGE } from '../../lib/confirmMessages'
import VaultAccountModal from './VaultAccountModal'
import { formatTry } from '../../lib/format'
import { useOps } from '../../lib/useOps'
import { useToast } from '../../lib/useToast'
import { VAULT_SUBSCRIPTION_LABELS } from '../../lib/vaultConstants'

export default function VaultSection() {
  const { data, saveVaultAccount, removeVaultAccount } = useOps()
  const { showToast } = useToast()
  const accounts = data.vaultAccounts ?? []
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)

  function handleSave(payload) {
    saveVaultAccount(payload, modal?.record?.id)
    showToast(modal?.record ? 'Hesap güncellendi.' : 'Hesap eklendi.')
    setModal(null)
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`${label} kopyalandı`)
    } catch {
      showToast('Kopyalama başarısız')
    }
  }

  return (
    <section className="settings-section panel-premium max-w-content p-6 md:p-8 vault-section">
      <h2 className="settings-section__title">Şirket Kasası</h2>
      <p className="vault-section__warn mt-3 text-sm" role="note">
        Hassas şifreleri burada düz metin olarak saklamayın. Bu alan şimdilik hesap
        takibi içindir; şifre notu AI tarafına maskelenir.
      </p>

      <button
        type="button"
        className="btn-primary btn-primary-inline mt-6"
        onClick={() => setModal({ record: null })}
      >
        Yeni hesap ekle
      </button>

      {accounts.length === 0 ? (
        <p className="mt-8 text-sm text-dim">Henüz kayıt yok.</p>
      ) : (
        <ul className="vault-list mt-6">
          {accounts.map((acc) => (
            <li key={acc.id} className="vault-card">
              <div className="vault-card__head">
                <h3 className="vault-card__title">{acc.serviceName}</h3>
                <span className="vault-card__meta">
                  {VAULT_SUBSCRIPTION_LABELS[acc.subscriptionType] || acc.subscriptionType}
                  {acc.feeAmount > 0 && ` · ${formatTry(acc.feeAmount)}`}
                </span>
              </div>
              <dl className="vault-card__dl">
                {acc.email && (
                  <>
                    <dt>E-posta</dt>
                    <dd>{acc.email}</dd>
                  </>
                )}
                {acc.username && (
                  <>
                    <dt>Kullanıcı</dt>
                    <dd>{acc.username}</dd>
                  </>
                )}
                {acc.renewalDate && (
                  <>
                    <dt>Yenileme</dt>
                    <dd>{acc.renewalDate}</dd>
                  </>
                )}
              </dl>
              <div className="vault-card__actions">
                {acc.linkUrl && (
                  <a
                    href={acc.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                  >
                    Linki aç
                  </a>
                )}
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    copyText(
                      [acc.serviceName, acc.email, acc.username].filter(Boolean).join(' · '),
                      'Bilgi',
                    )
                  }
                >
                  Kopyala
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setModal({ record: acc })}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setConfirm({
                      title: 'Hesabı sil',
                      message: DELETE_CONFIRM_MESSAGE,
                      id: acc.id,
                    })
                  }
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <VaultAccountModal
        key={modal?.record?.id ?? 'new-vault'}
        open={Boolean(modal)}
        record={modal?.record}
        onSave={handleSave}
        onClose={() => setModal(null)}
      />

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Sil"
        danger
        onConfirm={() => {
          removeVaultAccount(confirm.id)
          showToast('Hesap silindi.')
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  )
}
