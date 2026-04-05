import type { ReactNode } from 'react'
import DirectoryBackButton from './DirectoryBackButton'
import PageGraphic from './PageGraphic'

interface DirectoryShellProps {
  title: string
  eyebrow: string
  description?: string
  backHref?: string
  backLabel?: string
  variant?: 'default' | 'gateway'
  children: ReactNode
}

export default function DirectoryShell({
  title,
  eyebrow,
  description,
  backHref,
  backLabel,
  variant = 'default',
  children,
}: DirectoryShellProps) {
  const isGateway = variant === 'gateway'
  const hasBackButton = Boolean(backHref && backLabel)

  return (
    <main className={`directory-shell ${isGateway ? 'directory-shell--gateway' : ''} page-shell relative flex min-h-screen w-full flex-col overflow-x-clip`}>
      <header className={`directory-header ${isGateway ? 'directory-header--gateway' : ''} relative w-full border-b`}>
        <PageGraphic position="top" className={isGateway ? 'page-graphic--gateway' : undefined} />
        <div
          className={`mx-auto flex w-full flex-wrap gap-5 px-6 sm:px-8 lg:px-10 ${
            isGateway ? 'max-w-[1360px] py-7 sm:py-8 lg:py-9' : 'max-w-[1800px] py-8 sm:py-10 lg:py-11'
          } ${hasBackButton ? 'items-center justify-between' : 'items-end justify-start'}`}
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="directory-brand-mark flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold">
              MI
            </div>
            <div className="min-w-0">
              <p className="directory-eyebrow m-0 text-xs font-semibold uppercase">{eyebrow}</p>
              <h1 className="directory-title m-0 text-3xl font-extrabold tracking-tight sm:text-[2.2rem]">{title}</h1>
              {description ? (
                <p className="directory-description mt-2 mb-0 max-w-4xl text-sm leading-relaxed sm:text-[0.98rem]">{description}</p>
              ) : null}
            </div>
          </div>
          {hasBackButton ? <DirectoryBackButton fallbackHref={backHref!} label={backLabel!} /> : null}
        </div>
      </header>
      <div className={`directory-shell__body relative mx-auto flex w-full flex-1 flex-col ${isGateway ? 'max-w-[1360px]' : 'max-w-[1800px]'}`}>
        {children}
      </div>
      {isGateway ? null : (
        <footer className="directory-footer mt-auto w-full border-t">
          <PageGraphic position="bottom" />
        </footer>
      )}
    </main>
  )
}
