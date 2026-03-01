import { useState } from 'react'
import ShowTeam from './ShowTeam'

export interface CardProps {
  role: string
  photo?: string
  title: string
  name: string
  phone: string
  email: string
  showPhoto?: boolean
  showTeamButton?: boolean
}

const Card = ({
  role,
  photo,
  title,
  name,
  phone,
  email,
  showPhoto = true,
  showTeamButton = true,
}: CardProps) => {
  const [showTeamConnect, setShowTeamConnect] = useState(false)

  const handleToggleTeamConnect = () => {
    setShowTeamConnect((current) => !current)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{
        backgroundColor: '#1e4f5c',
        border: '2px solid #c9a43e',
        borderRadius: '16px',
        width: '340px',
        padding: '24px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '22px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            lineHeight: 1.25,
            margin: 0,
          }}>
            {role}
          </p>
        </div>

        {/* Photo */}
        {showPhoto && photo ? (
          <div style={{
            width: '110px',
            height: '110px',
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
            fontSize: '17px',
            margin: '0 0 4px 0',
          }}>
            {title}
          </p>
          <p style={{
            color: '#c9a43e',
            fontWeight: 800,
            fontSize: '22px',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {name}
          </p>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', color: '#ffffff', fontSize: '14px', lineHeight: 1.3, margin: 0 }}>
          <p style={{ margin: 0 }}>{phone}</p>
          <p style={{ margin: 0 }}>{email}</p>
        </div>

        {/* Keep slot height so card size is consistent even without the button */}
        <div style={{ minHeight: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {showTeamButton ? (
            <button
              type="button"
              onClick={handleToggleTeamConnect}
              style={{
                backgroundColor: '#c9a43e',
                border: 'none',
                borderRadius: '999px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 36px',
                cursor: 'pointer',
              }}
            >
              Show Team
            </button>
          ) : null}
        </div>
      </div>

      {showTeamButton && showTeamConnect && <ShowTeam />}
    </div>
  )
}

export default Card
