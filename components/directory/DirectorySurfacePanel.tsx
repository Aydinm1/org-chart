import type { ReactNode } from 'react'

interface DirectorySurfacePanelProps {
  variant?: 'default' | 'directory' | 'gateway'
  children: ReactNode
}

export default function DirectorySurfacePanel({ variant = 'default', children }: DirectorySurfacePanelProps) {
  const panelClassName = variant === 'directory'
    ? 'surface-panel--directory rounded-[28px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6'
    : 'surface-panel--gateway rounded-[30px] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7'
  const contentClassName = variant === 'directory'
    ? 'space-y-5 sm:space-y-6 lg:space-y-7'
    : 'space-y-5 sm:space-y-6 lg:space-y-7'

  return (
    <div className={`board-surface surface-panel-layers relative overflow-hidden ${panelClassName}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/65 via-white/20 to-transparent" />
      {variant !== 'directory' ? (
        <>
          <div className="pointer-events-none absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border-strong)]/60 to-transparent" />
          <div className="pointer-events-none absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border-strong)]/35 to-transparent" />
        </>
      ) : null}
      <div className={`relative ${contentClassName}`}>{children}</div>
    </div>
  )
}
