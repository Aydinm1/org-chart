import DirectoryCardGrid from '../components/directory/DirectoryCardGrid'
import DirectoryShell from '../components/directory/DirectoryShell'
import { loadRootNavigation } from '../lib/directory/page-builder'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const rootNavigationResult = await loadRootNavigation()
    .then((data) => ({ data, error: null }))
    .catch((error: unknown) => ({
      data: null,
      error: error instanceof Error ? error.message : 'The directory could not be loaded.',
    }))

  if (rootNavigationResult.data) {
    const { data: rootNavigation } = rootNavigationResult
    return (
      <DirectoryShell
        title={rootNavigation.rootGroup.name}
        eyebrow="Org Directory"
        description="Browse the top-level units below Midwest Institutions."
      >
        <div className="surface-panel rounded-[28px] border border-[#d9cca7] bg-[#f8f4ea]/92 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <DirectoryCardGrid cards={rootNavigation.cards} />
          {rootNavigation.cards.length === 0 ? (
            <p className="mt-6 text-sm text-[#173942]/78">No child groups were found under the configured root group.</p>
          ) : null}
        </div>
      </DirectoryShell>
    )
  }

  return (
    <DirectoryShell
      title="Directory Unavailable"
      eyebrow="Org Directory"
      description="The root directory page could not be assembled from Airtable."
    >
      <div className="surface-panel rounded-[28px] border border-[#d9cca7] bg-[#f8f4ea]/92 px-6 py-8 text-sm text-[#173942]/82 sm:px-8 sm:py-10 lg:px-10">
        {rootNavigationResult.error}
      </div>
    </DirectoryShell>
  )
}
