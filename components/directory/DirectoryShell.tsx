import type { ReactNode } from 'react'
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
    <main className="directory-shell page-shell relative flex min-h-screen w-full flex-col overflow-x-clip">
      <header className="directory-header relative w-full border-b">
        <PageGraphic position="top" />
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-5 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
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
          {backHref && backLabel ? <DirectoryBackButton fallbackHref={backHref} label={backLabel} /> : null}
        </div>
      </header>
      <div className="relative mx-auto flex w-full max-w-[1800px] flex-1 flex-col">
        {children}
      </div>
      <footer className="directory-footer mt-auto w-full border-t">
        <PageGraphic position="bottom" />
      </footer>
    </main>
  )
}
