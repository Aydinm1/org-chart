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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
      <div style={{
        backgroundColor: '#1e4f5c',
        border: '2px solid #c9a43e',
        borderRadius: '16px',
        width: '300px',
        padding: '20px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            width: '100%',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            lineHeight: 1.25,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {role}
          </p>
        </div>

        {/* Photo */}
        {hasVisiblePhoto ? (
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#f0e8d8',
            flexShrink: 0,
          }}>
            <img
              src={photo}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null}

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#c9a43e',
            fontWeight: 600,
            fontSize: '18px',
            margin: '0 0 4px 0',
          }}>
            {title}
          </p>
          <p style={{
            color: '#c9a43e',
            fontWeight: 800,
            fontSize: '24px',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {name}
          </p>
        </div>

        {/* Contact */}
        {phone || email ? (
          <div style={{ textAlign: 'center', color: '#ffffff', fontSize: '16px', lineHeight: 1.35, margin: 0 }}>
            {phone ? <p style={{ margin: 0 }}>{phone}</p> : null}
            {email ? <p style={{ margin: 0 }}>{email}</p> : null}
          </div>
        ) : null}

        {/* Keep slot height so card size is consistent even without the button */}
        <div style={{ minHeight: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {showTeamButton ? (
            <button
              type="button"
              onClick={handleShowMore}
              style={{
                backgroundColor: '#c9a43e',
                border: 'none',
                borderRadius: '999px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '9px 28px',
                cursor: 'pointer',
              }}
            >
              Show Team
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Card
