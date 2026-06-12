// BriefAI brand assets. Imported through Vite so they bundle into /assets with
// hashed names — this makes them resolve correctly inside the Power Apps host
// (absolute /public paths would point at the host root and 404).
import markUrl from '../assets/brief-mark.svg'
import logoWhiteUrl from '../assets/brief-logo-white.svg'
import logoDarkUrl from '../assets/brief-logo.svg'

// The icon mark alone — used for the front-desk avatar, hero, and thinking dots.
export function BriefMark({ size = 36, className = '' }) {
  return (
    <img
      src={markUrl}
      alt="BriefAI"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain ${className}`}
    />
  )
}

// The full logo (mark + wordmark). variant 'white' for dark backgrounds
// (the navy sidebar), 'dark' for light backgrounds.
export function BriefLogo({ variant = 'dark', className = '' }) {
  return <img src={variant === 'white' ? logoWhiteUrl : logoDarkUrl} alt="BriefAI" className={className} />
}
