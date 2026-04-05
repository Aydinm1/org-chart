import Link from 'next/link'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

interface DirectoryRootStageProps {
  cards: DirectoryCardViewModel[]
}

interface RootStageCopy {
  body: string
  cta?: string
}

const ROOT_STAGE_COPY_BY_TITLE: Record<string, RootStageCopy> = {
  CAB: { body: 'CAB sample description' },
  'Midwest Council': { body: 'Midwest Council sample description', cta: 'Explore directory' },
  GRB: { body: 'GRB sample description' },
  ITREB: { body: 'ITREB sample description' },
}

export default function DirectoryRootStage({ cards }: DirectoryRootStageProps) {
  const featuredCard = cards.find((card) => card.title === 'Midwest Council' && Boolean(card.destinationGroupId))
    ?? cards.find((card) => Boolean(card.destinationGroupId))

  return (
    <section className="root-stage-shell" aria-label="Central branches">
      <div className="root-stage-grid" role="list" aria-label="Central branches">
        {cards.map((card, index) => {
          const isContinuation = featuredCard?.id === card.id && Boolean(card.destinationGroupId)
          const copy = ROOT_STAGE_COPY_BY_TITLE[card.title] ?? {
            body: `${card.title} sample description`,
            cta: isContinuation ? 'Explore directory' : undefined,
          }
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
    </section>
  )
}
