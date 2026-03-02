import Card, { type CardProps } from './Card'

interface BoardSectionProps {
  title: string
  cards: CardProps[]
}

const BoardSection = ({ title, cards }: BoardSectionProps) => {
  return (
    <section className="w-full border-t-4 border-[#c9a43e] bg-transparent">
      <div className="mx-auto w-full max-w-[1800px] px-6 py-10">
        <h2 className="m-0 text-2xl font-extrabold text-[#173942]">{title}</h2>
        <div className="mt-6 rounded-xl border border-[#c9a43e]/45 p-4 bg-transparent">
          <div className="grid grid-cols-1 justify-items-center gap-x-3 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card, index) => (
              <Card key={card.id ?? `${title}-${index}`} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BoardSection
