import DirectoryShell from './DirectoryShell'
import DirectoryBackButton from './DirectoryBackButton'
import DirectorySection from './DirectorySection'
import type { GroupPageViewModel } from '../../lib/directory/types'

interface DirectoryPageProps {
  page: GroupPageViewModel
}

export default function DirectoryPage({ page }: DirectoryPageProps) {
  const backHref = page.parentGroup
    ? page.parentGroup.parentGroupId === null
      ? '/'
      : `/groups/${page.parentGroup.id}`
    : '/'
  const hasAnyCards = page.sections.some((section) => section.cards.length > 0)

  return (
    <DirectoryShell
      title={page.group.name}
      eyebrow={page.parentGroup ? page.parentGroup.name : 'Org Directory'}
      description="Sections and cards below are assembled from Display Sections, Memberships, and Unit Placements."
    >
      <div className="mx-auto w-full max-w-[1780px] px-6 pt-8 sm:px-8 lg:px-10">
        <div>
          <DirectoryBackButton fallbackHref={backHref} label="Back" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1780px] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div className="board-surface relative overflow-hidden rounded-[28px] border border-[#decfa9] bg-[#F8F4EA]/92 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff7e6]/75 to-transparent" />
          <div className="relative space-y-12 sm:space-y-14">
        {page.sections.length > 0 ? (
              <>
                {page.sections.map((section, index) => (
                  <div key={section.id}>
                    <DirectorySection section={section} />
                    {index < page.sections.length - 1 ? (
                      <div className="mt-12 mx-auto h-px w-full rounded-full bg-gradient-to-r from-transparent via-[#c9a43e]/65 to-transparent" />
                    ) : null}
                  </div>
                ))}
              </>
        ) : (
              <div className="rounded-[20px] border border-dashed border-[#cbb57d] bg-[#fff9ec] px-5 py-4 text-sm text-[#173942]/78">
                No display sections are configured for this group yet.
              </div>
        )}
        {page.sections.length > 0 && !hasAnyCards ? (
              <p className="text-sm text-[#173942]/78">The sections exist, but no memberships or unit placements are currently assigned.</p>
        ) : null}
          </div>
        </div>
      </div>
    </DirectoryShell>
  )
}
