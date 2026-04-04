import DirectoryCardGrid from '../components/directory/DirectoryCardGrid'
import DirectoryShell from '../components/directory/DirectoryShell'
import DirectorySurfacePanel from '../components/directory/DirectorySurfacePanel'
import { loadRootNavigation } from '../lib/directory/page-builder'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let rootNavigation = null
  let loadError = 'The directory could not be loaded.'

  try {
    rootNavigation = await loadRootNavigation()
  } catch (error) {
    loadError = error instanceof Error ? error.message : loadError
  }

  if (rootNavigation) {
    return (
      <DirectoryShell
        title={rootNavigation.rootGroup.name}
        eyebrow="Org Directory"
        description="Browse the top-level units below Midwest Institutions."
      >
        <div className="mx-auto w-full max-w-[1780px] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <DirectorySurfacePanel>
            <section className="section-lane w-full">
              <div className="section-grid-wrap">
                <DirectoryCardGrid cards={rootNavigation.cards} />
              </div>
            </section>
            {rootNavigation.cards.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-soft)]">No child groups were found under the configured root group.</p>
            ) : null}
          </DirectorySurfacePanel>
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
      <div className="board-surface surface-panel-layers rounded-[32px] px-6 py-8 text-sm text-[var(--color-ink-soft)] sm:px-8 sm:py-10 lg:px-10">
        {loadError}
      </div>
    </DirectoryShell>
  )
}
