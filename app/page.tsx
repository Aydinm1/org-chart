import DirectoryRootStage from '../components/directory/DirectoryRootStage'
import DirectoryShell from '../components/directory/DirectoryShell'
import { getCurrentUser } from '../lib/auth/server'
import { loadRootNavigation } from '../lib/directory/page-builder'

export const revalidate = 300

export default async function HomePage() {
  const currentUser = await getCurrentUser()
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
        currentUser={currentUser}
      >
        <div className="gateway-page-wrap mx-auto w-full max-w-[1120px] px-6 pb-12 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16">
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
      description="The root directory page could not be assembled due to an error. Please try again later or contact support if the issue persists."
      currentUser={currentUser}
    >
      <div className="board-surface surface-panel-layers rounded-[32px] px-6 py-8 text-sm text-[var(--color-ink-soft)] sm:px-8 sm:py-10 lg:px-10">
        {loadError}
      </div>
    </DirectoryShell>
  )
}
