import { THEME_MODE } from '../lib/themeMode'
import { VIEW_MODE } from '../lib/viewMode'
import { useTheme } from '../lib/useTheme'
import { useViewMode } from '../lib/useViewMode'

const VIEW_OPTIONS = [
  { id: VIEW_MODE.AUTO, label: 'Otomatik', hint: 'Ekran genişliğine göre' },
  { id: VIEW_MODE.MOBILE, label: 'Mobil görünüm', hint: 'Uygulama / PWA düzeni' },
  { id: VIEW_MODE.WEB, label: 'Web görünüm', hint: 'Masaüstü panel düzeni' },
]

const THEME_OPTIONS = [
  { id: THEME_MODE.AUTO, label: 'Otomatik', hint: 'Cihaz temasını takip eder' },
  { id: THEME_MODE.DAY, label: 'Gündüz', hint: 'Sıcak krem zemin, kömür yazı' },
  { id: THEME_MODE.NIGHT, label: 'Gece', hint: 'Sinematik koyu kontrol odası' },
]

function OptionGroup({ title, hint, activeLabel, options, value, onChange, name }) {
  return (
    <div className="appearance-block">
      <h3 className="appearance-block__title">{title}</h3>
      {hint && <p className="appearance-block__hint">{hint}</p>}
      <p className="view-mode-active-hint">{activeLabel}</p>
      <div className="view-mode-options mt-4" role="radiogroup" aria-label={title}>
        {options.map((opt) => (
          <label key={opt.id} className="view-mode-option">
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            <span className="view-mode-option__body">
              <span className="view-mode-option__label">{opt.label}</span>
              <span className="view-mode-option__hint">{opt.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function AppearanceSettings() {
  const { preference: viewPref, effective: viewEff, setPreference: setView } =
    useViewMode()
  const { preference: themePref, effective: themeEff, setPreference: setTheme } =
    useTheme()

  return (
    <section className="settings-section panel-premium max-w-content p-6 md:p-8">
      <h2 className="settings-section__title">Görünüm</h2>
      <p className="mt-2 text-sm text-dim">
        Layout ve renk tercihleri bu cihazda kaydedilir; sayfa yenilemeden
        uygulanır.
      </p>

      <OptionGroup
        title="Düzen"
        options={VIEW_OPTIONS}
        name="view-mode"
        value={viewPref}
        onChange={setView}
        activeLabel={
          <>
            Şu an: <strong>{viewEff === 'mobile' ? 'Mobil' : 'Web'}</strong>
            {viewPref === VIEW_MODE.AUTO ? ' (otomatik)' : ''}
          </>
        }
      />

      <OptionGroup
        title="Tema"
        hint="Otomatik · Gündüz · Gece — tüm ekranlar aynı token setini kullanır."
        options={THEME_OPTIONS}
        name="theme-mode"
        value={themePref}
        onChange={setTheme}
        activeLabel={
          <>
            Şu an: <strong>{themeEff === 'night' ? 'Gece' : 'Gündüz'}</strong>
            {themePref === THEME_MODE.AUTO ? ' (otomatik)' : ''}
          </>
        }
      />
    </section>
  )
}
