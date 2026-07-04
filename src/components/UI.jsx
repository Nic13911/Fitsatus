export function Header({ eyebrow, title, subtitle }) {
  return (
    <header className="px-6 pt-8 pb-10 bg-ink text-paper rounded-b-3xl">
      {eyebrow && <p className="text-amber text-xs font-semibold tracking-[0.2em] uppercase mb-1">{eyebrow}</p>}
      <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
      {subtitle && <p className="text-paper/70 text-sm mt-1">{subtitle}</p>}
    </header>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl2 border border-line p-5 shadow-sm ${className}`}>{children}</div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'w-full rounded-xl py-3 font-semibold text-sm transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-ink text-paper hover:bg-ink-light',
    accent: 'bg-amber text-ink-dark hover:bg-amber-dark',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-paper'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block mb-4 ${className}`}>
      <span className="block text-xs font-semibold text-ink-dark/70 uppercase tracking-wide mb-1">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber bg-paper'

export function Alert({ children, tone = 'error' }) {
  const tones = {
    error: 'bg-coral/10 text-coral border-coral/30',
    success: 'bg-ink/5 text-ink border-ink/20'
  }
  return <div className={`text-sm border rounded-lg px-3 py-2 mb-4 ${tones[tone]}`}>{children}</div>
}
