import Link from 'next/link'
import type { ReactNode } from 'react'

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
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 lg:gap-8">
        <header className="surface-panel rounded-[30px] border border-[#d9cca7] bg-[#f7f3e9]/94 px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#c9a43e] bg-[#1e4f5c] text-lg font-extrabold tracking-[0.08em] text-[#f5e8c0] shadow-[0_12px_22px_-14px_rgba(9,28,34,0.95)]">
                MI
              </div>
              <div className="min-w-0">
                <p className="m-0 text-xs font-semibold tracking-[0.22em] text-[#6e5b2d] uppercase">{eyebrow}</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#173942] sm:text-4xl">{title}</h1>
                {description ? (
                  <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[#173942]/82 sm:text-base">{description}</p>
                ) : null}
              </div>
            </div>
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="rounded-full border border-[#c9a43e] bg-[#fff9ec] px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#173942] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff2d1]"
              >
                {backLabel}
              </Link>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
