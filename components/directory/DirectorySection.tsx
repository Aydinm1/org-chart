import type { DirectorySectionViewModel } from '../../lib/directory/types'
import DirectoryCardGrid from './DirectoryCardGrid'

interface DirectorySectionProps {
  section: DirectorySectionViewModel
}

export default function DirectorySection({ section }: DirectorySectionProps) {
  return (
    <section className="section-lane">
      {section.showTitle ? (
        <div className="section-lane__header">
          <h2 className="m-0 text-[1.28rem] font-bold tracking-[-0.02em] text-[var(--color-ink)] sm:text-[1.38rem]">
            {section.title}
          </h2>
        </div>
      ) : null}
      {section.cards.length > 0 ? (
        <div className="section-grid-wrap">
          <DirectoryCardGrid cards={section.cards} />
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,250,239,0.86)] px-5 py-4 text-sm text-[var(--color-ink-soft)]">
          No entries are currently assigned to this section.
        </div>
      )}
    </section>
  )
}
