import Link from 'next/link'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

interface DirectoryRootStageProps {
  cards: DirectoryCardViewModel[]
}

interface RootStageCopy {
  body: string
  footer: string
  cta?: string
}

const DEFAULT_CONTEXT_COPY: RootStageCopy = {
  body: 'Leadership, committees, and regional council work.',
  footer: 'Institutional branch',
}

const CONTINUATION_COPY: RootStageCopy = {
  body: 'Members, leadership, and sections continue here.',
  footer: 'Midwest Council directory',
  cta: 'Explore directory',
}

export default function DirectoryRootStage({ cards }: DirectoryRootStageProps) {
  const featuredCard = cards.find((card) => card.title === 'Midwest Council' && Boolean(card.destinationGroupId))
    ?? cards.find((card) => Boolean(card.destinationGroupId))

  return (
    <section className="root-stage-shell" aria-labelledby="root-stage-title">
      <div className="root-stage-frame">
        <header className="root-stage-header">
          <div className="root-stage-header__copy">
            <h2 id="root-stage-title" className="root-stage-heading m-0">
              Central branches
            </h2>
            <p className="root-stage-summary m-0">
              Four standing branches gathered in a shared view.
            </p>
          </div>
        </header>

        <div className="root-stage-grid" role="list" aria-label="Central branches">
          {cards.map((card, index) => {
            const isContinuation = featuredCard?.id === card.id && Boolean(card.destinationGroupId)
            const copy = isContinuation ? CONTINUATION_COPY : DEFAULT_CONTEXT_COPY
            const body = (
              <article
                role="listitem"
                className={`root-stage-card root-stage-card--${index + 1} ${isContinuation ? 'root-stage-card--continuation' : 'root-stage-card--context'}`}
              >
                <div className="root-stage-card__frame">
                  <div className="root-stage-card__body">
                    <h3 className="root-stage-card__title m-0">{card.title}</h3>
                    <p className="root-stage-card__copy m-0">{copy.body}</p>
                  </div>

                  <div className={`root-stage-card__footer ${isContinuation ? 'root-stage-card__footer--action' : ''}`}>
                    <span className="root-stage-card__footer-note">{copy.footer}</span>
                    {isContinuation && copy.cta ? <span className="root-stage-card__cta">{copy.cta}</span> : null}
                  </div>
                </div>
              </article>
            )

            if (!isContinuation || !card.destinationGroupId) {
              return (
                <div key={card.id} className="root-stage-slot">
                  {body}
                </div>
              )
            }

            return (
              <Link key={card.id} href={`/groups/${card.destinationGroupId}`} prefetch className="root-stage-link">
                {body}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
