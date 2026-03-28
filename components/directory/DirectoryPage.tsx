import DirectoryShell from './DirectoryShell'
import DirectorySection from './DirectorySection'
import type { GroupPageViewModel } from '../../lib/directory/types'

interface DirectoryPageProps {
  page: GroupPageViewModel
}

export default function DirectoryPage({ page }: DirectoryPageProps) {
  const backHref = page.parentGroup ? `/groups/${page.parentGroup.id}` : '/'
  const backLabel = page.parentGroup ? `Back to ${page.parentGroup.name}` : 'Back to Midwest Institutions'
  const hasAnyCards = page.sections.some((section) => section.cards.length > 0)

  return (
    <DirectoryShell
      title={page.group.name}
      eyebrow={page.parentGroup ? page.parentGroup.name : 'Org Directory'}
      description="Sections and cards below are assembled from Display Sections, Memberships, and Unit Placements."
      backHref={backHref}
      backLabel={backLabel}
    >
      <div className="surface-panel rounded-[28px] border border-[#d9cca7] bg-[#f8f4ea]/92 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        {page.sections.length > 0 ? (
          <div className="space-y-10">
            {page.sections.map((section, index) => (
              <div key={section.id}>
                <DirectorySection section={section} />
                {index < page.sections.length - 1 ? (
                  <div className="mt-10 h-px w-full rounded-full bg-gradient-to-r from-transparent via-[#c9a43e]/65 to-transparent" />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#cbb57d] bg-[#fff9ec] px-5 py-4 text-sm text-[#173942]/78">
            No display sections are configured for this group yet.
          </div>
        )}
        {page.sections.length > 0 && !hasAnyCards ? (
          <p className="mt-8 text-sm text-[#173942]/78">The sections exist, but no memberships or unit placements are currently assigned.</p>
        ) : null}
      </div>
    </DirectoryShell>
  )
}
