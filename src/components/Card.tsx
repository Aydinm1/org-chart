export interface CardProps {
  id?: string
  role: string
  photo?: string
  title: string
  name: string
  phone?: string
  email?: string
  showPhoto?: boolean
  showTeamButton?: boolean
  onShowMore?: (id?: string) => void
}

const Card = ({
  id,
  role,
  photo,
  title,
  name,
  phone,
  email,
  showPhoto = true,
  showTeamButton = true,
  onShowMore,
}: CardProps) => {
  const hasVisiblePhoto = showPhoto && Boolean(photo)

  const handleShowMore = () => {
    onShowMore?.(id)
  }

  return (
    <article className="card-elevated w-full max-w-[260px]">
      <div className="relative flex h-full min-h-[386px] flex-col items-center rounded-[18px] border-2 border-[#c9a43e] bg-[#1e4f5c] px-4 py-5 text-center shadow-[0_16px_30px_-22px_rgba(9,28,34,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_38px_-24px_rgba(9,28,34,0.95)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-10 rounded-b-full bg-gradient-to-b from-white/10 to-transparent" />

        <header className="flex min-h-[52px] items-center justify-center">
          <p
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            className="overflow-hidden text-ellipsis text-[0.98rem] font-semibold leading-tight tracking-[0.04em] text-white uppercase"
          >
            {role}
          </p>
        </header>

        {hasVisiblePhoto ? (
          <div className="mt-3 h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full bg-[#f0e8d8] ring-2 ring-[#f6e9c7]/35">
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-3 text-center">
          <p className="m-0 text-[0.96rem] font-medium text-[#d2b15a]">{title}</p>
          <p className="m-0 text-[1.4rem] font-bold leading-tight text-[#d8b651]">{name}</p>
        </div>

        {phone || email ? (
          <div className="mt-3 text-center text-[0.95rem] leading-snug text-white/92">
            {phone ? <p className="m-0">{phone}</p> : null}
            {email ? <p className="m-0">{email}</p> : null}
          </div>
        ) : null}

        <div className="mt-auto flex min-h-10 w-full items-end justify-center pt-3">
          {showTeamButton ? (
            <button
              type="button"
              onClick={handleShowMore}
              className="rounded-full bg-[#c9a43e] px-6 py-2 text-[11px] font-bold tracking-[0.08em] text-white uppercase transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d8b651] hover:shadow-[0_10px_16px_-10px_rgba(9,28,34,0.85)]"
            >
              Show Team
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default Card
