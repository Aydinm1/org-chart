import pattern from '../assets/pattern.png'

interface PageGraphicProps {
  position: 'top' | 'bottom'
}

const PageGraphic = ({ position }: PageGraphicProps) => {
  return (
    <div className={`w-full ${position === 'bottom' ? 'rotate-180' : ''}`} aria-hidden="true">
      <img src={pattern} alt="" className="block h-16 w-full object-cover" />
    </div>
  )
}

export default PageGraphic
