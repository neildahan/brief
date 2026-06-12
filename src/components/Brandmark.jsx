// BriefAI brand assets (from /public). The mark + full logos are real SVGs;
// these thin wrappers render them at the right size for each surface.

// The icon mark alone — used for the front-desk avatar, hero, and thinking dots.
export function BriefMark({ size = 36, className = '' }) {
  return (
    <img
      src="/brief-mark.svg"
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
  const src = variant === 'white' ? '/brief-logo-white.svg' : '/brief-logo.svg'
  return <img src={src} alt="BriefAI" className={className} />
}
