import { useOperator } from '../lib/useOperator'

export default function OperatorFab() {
  const { open, setOpen } = useOperator()

  return (
    <button
      type="button"
      className={`operator-fab${open ? ' is-open' : ''}`}
      onClick={() => setOpen(!open)}
      aria-label={open ? 'Operatörü kapat' : 'Daydream Operator'}
      aria-expanded={open}
    >
      <span className="operator-fab__mark" aria-hidden>
        ◆
      </span>
      <span className="operator-fab__label">Operator</span>
    </button>
  )
}
