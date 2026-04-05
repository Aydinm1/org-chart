interface PageGraphicProps {
  position: 'top' | 'bottom'
  className?: string
}

export default function PageGraphic({ position, className }: PageGraphicProps) {
  return (
    <div className={`page-graphic w-full ${position === 'bottom' ? 'rotate-180' : ''} ${className ?? ''}`} aria-hidden="true">
      <img src="/assets/pattern.png" alt="" className="page-graphic-image block h-16 w-full object-cover" />
    </div>
  )
}
