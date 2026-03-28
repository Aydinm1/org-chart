import type { DirectorySectionViewModel } from '../../lib/directory/types'
import DirectoryCardGrid from './DirectoryCardGrid'

interface DirectorySectionProps {
  section: DirectorySectionViewModel
}

export default function DirectorySection({ section }: DirectorySectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-2xl font-extrabold tracking-tight text-[#173942]">{section.title}</h2>
        </div>
      </div>
      {section.cards.length > 0 ? (
        <DirectoryCardGrid cards={section.cards} />
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#cbb57d] bg-[#fff9ec] px-5 py-4 text-sm text-[#173942]/78">
          No entries are currently assigned to this section.
        </div>
      )}
    </section>
  )
}
