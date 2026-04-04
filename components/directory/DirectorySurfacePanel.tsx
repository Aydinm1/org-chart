import type { ReactNode } from 'react'

interface DirectorySurfacePanelProps {
  children: ReactNode
}

export default function DirectorySurfacePanel({ children }: DirectorySurfacePanelProps) {
  return (
    <div className="board-surface surface-panel-layers relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/65 via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border-strong)]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border-strong)]/35 to-transparent" />
      <div className="relative space-y-6 sm:space-y-7 lg:space-y-8">{children}</div>
    </div>
  )
}
