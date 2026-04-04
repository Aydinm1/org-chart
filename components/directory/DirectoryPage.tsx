import DirectoryShell from './DirectoryShell'
import DirectoryBackButton from './DirectoryBackButton'
import DirectorySection from './DirectorySection'
import DirectorySurfacePanel from './DirectorySurfacePanel'
import type { GroupPageViewModel } from '../../lib/directory/types'

interface DirectoryPageProps {
  page: GroupPageViewModel
}

export default function DirectoryPage({ page }: DirectoryPageProps) {
  const hasAnyCards = page.sections.some((section) => section.cards.length > 0)

  return (
    <DirectoryShell
      title={page.group.name}
      eyebrow={page.parentGroup ? page.parentGroup.name : 'Org Directory'}
      description="Sections and cards below are assembled from Display Sections, Memberships, and Unit Placements."
    >
      <div className="mx-auto w-full max-w-[1780px] px-6 pt-8 sm:px-8 sm:pt-9 lg:px-10 lg:pt-10">
        <div>
          <DirectoryBackButton fallbackHref={page.backHref} label={page.backLabel} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1780px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <DirectorySurfacePanel>
          {page.sections.length > 0 ? (
            <>
              {page.sections.map((section) => (
                <div key={section.id}>
                  <DirectorySection section={section} />
                </div>
              ))}
            </>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,250,239,0.86)] px-5 py-4 text-sm text-[var(--color-ink-soft)]">
              No display sections are configured for this group yet.
            </div>
          )}
          {page.sections.length > 0 && !hasAnyCards ? (
            <p className="text-sm text-[var(--color-ink-soft)]">The sections exist, but no memberships or unit placements are currently assigned.</p>
          ) : null}
        </DirectorySurfacePanel>
      </div>
    </DirectoryShell>
  )
}
