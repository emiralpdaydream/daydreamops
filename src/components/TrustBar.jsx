const tools = ['Notion', 'Airtable', 'Asana', 'Slack', 'Stripe']

export default function TrustBar({ className = '' }) {
  return (
    <div className={`trust-bar ${className}`}>
      <p className="text-center text-xs text-muted">
        Operasyonlarınızın yanında çalışan araçlar
      </p>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {tools.map((name) => (
          <li
            key={name}
            className="text-xs font-semibold tracking-wide text-zinc-400"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}
