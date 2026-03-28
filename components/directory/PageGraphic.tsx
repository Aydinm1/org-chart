import pattern from '../../src/assets/pattern.png'

interface PageGraphicProps {
  position: 'top' | 'bottom'
}

export default function PageGraphic({ position }: PageGraphicProps) {
  return (
    <div className={`w-full ${position === 'bottom' ? 'rotate-180' : ''}`} aria-hidden="true">
      <img src={pattern.src} alt="" className="block h-16 w-full object-cover" />
    </div>
  )
}
