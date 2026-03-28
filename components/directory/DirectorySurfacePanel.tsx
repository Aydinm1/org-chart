import type { ReactNode } from 'react'

interface DirectorySurfacePanelProps {
  children: ReactNode
}

export default function DirectorySurfacePanel({ children }: DirectorySurfacePanelProps) {
  return (
    <div className="board-surface relative overflow-hidden rounded-[28px] border border-[#decfa9] bg-[#F8F4EA]/92 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff7e6]/75 to-transparent" />
      <div className="relative space-y-12 sm:space-y-14">{children}</div>
    </div>
  )
}
