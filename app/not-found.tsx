import Link from 'next/link'
import DirectoryShell from '../components/directory/DirectoryShell'

export default function NotFound() {
  return (
    <DirectoryShell
      title="Directory Page Not Found"
      eyebrow="Org Directory"
      backHref="/"
      backLabel="Back to Midwest Institutions"
    >
      <div className="board-surface surface-panel-layers rounded-[32px] px-6 py-10 text-[var(--color-ink)] sm:px-8">
        The requested group could not be found. Return to the{' '}
        <Link href="/" className="font-semibold text-[var(--color-structure)] underline decoration-[var(--color-accent)] underline-offset-4">
          directory home
        </Link>
        .
      </div>
    </DirectoryShell>
  )
}
