import DirectoryRootStage from '../components/directory/DirectoryRootStage'
import DirectoryShell from '../components/directory/DirectoryShell'
import { loadRootNavigation } from '../lib/directory/page-builder'

export const revalidate = 300

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
        variant="gateway"
        title={rootNavigation.rootGroup.name}
        eyebrow="Org Directory"
        description="A shared view across the organization’s four central branches."
      >
        <div className="gateway-page-wrap mx-auto w-full max-w-[1360px] px-6 pb-14 sm:px-8 sm:pb-16 lg:px-10 lg:pb-[4.5rem]">
          <DirectoryRootStage cards={rootNavigation.cards} />
          {rootNavigation.cards.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--color-ink-soft)]">No child groups were found under the configured root group.</p>
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
      <div className="board-surface surface-panel-layers rounded-[32px] px-6 py-8 text-sm text-[var(--color-ink-soft)] sm:px-8 sm:py-10 lg:px-10">
        {loadError}
      </div>
    </DirectoryShell>
  )
}
