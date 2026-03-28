import type { ReactNode } from 'react'
import background from '../../src/assets/background.png'
import DirectoryBackButton from './DirectoryBackButton'
import PageGraphic from './PageGraphic'

interface DirectoryShellProps {
  title: string
  eyebrow: string
  description?: string
  backHref?: string
  backLabel?: string
  children: ReactNode
}

export default function DirectoryShell({
  title,
  eyebrow,
  description,
  backHref,
  backLabel,
  children,
}: DirectoryShellProps) {
  return (
    <main
      className="relative flex min-h-screen w-full flex-col overflow-x-clip"
      style={{
        backgroundColor: '#f0ece1',
        backgroundImage: `radial-gradient(1200px 520px at 8% -8%, rgba(201, 164, 62, 0.2), transparent 60%), radial-gradient(920px 520px at 96% 12%, rgba(23, 57, 66, 0.14), transparent 62%), url(${background.src})`,
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundPosition: 'top left, top right, top left',
        backgroundSize: 'auto, auto, auto',
      }}
    >
      <header className="relative w-full border-b border-[#dccca7] bg-[#f7f4ea]/92 shadow-[0_14px_30px_-28px_rgba(23,57,66,0.9)] backdrop-blur-[1px]">
        <PageGraphic position="top" />
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 py-8 sm:py-9">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#c9a43e] bg-[#1e4f5c] text-xl font-extrabold text-[#f5e8c0] shadow-[0_12px_22px_-14px_rgba(9,28,34,0.95)]">
              MI
            </div>
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold tracking-[0.2em] text-[#6e5b2d] uppercase">{eyebrow}</p>
              <h1 className="m-0 text-3xl font-extrabold tracking-tight text-[#173942]">{title}</h1>
              {description ? (
                <p className="mt-2 mb-0 max-w-4xl text-sm leading-relaxed text-[#173942]/80">{description}</p>
              ) : null}
            </div>
          </div>
          {backHref && backLabel ? <DirectoryBackButton fallbackHref={backHref} label={backLabel} /> : null}
        </div>
      </header>
      <div className="relative mx-auto flex w-full max-w-[1800px] flex-1 flex-col">
        {children}
      </div>
      <footer className="mt-auto w-full border-t border-[#dccca7] bg-[#f7f4ea]/92 shadow-[0_-14px_30px_-28px_rgba(23,57,66,0.8)]">
        <PageGraphic position="bottom" />
      </footer>
    </main>
  )
}
