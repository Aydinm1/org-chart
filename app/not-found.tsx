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
      <div className="surface-panel rounded-[28px] border border-[#d9cca7] bg-[#f8f4ea]/92 px-6 py-10 text-[#173942] sm:px-8">
        The requested group could not be found. Return to the{' '}
        <Link href="/" className="font-semibold text-[#1e4f5c] underline decoration-[#c9a43e] underline-offset-4">
          directory home
        </Link>
        .
      </div>
    </DirectoryShell>
  )
}
