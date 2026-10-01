import { useState } from 'react'
import { PLACEHOLDER } from '../data/media.js'

export default function JImage({ src, alt = '', className = '', fallbackLabel = 'Imagem indisponível', ...rest }) {
  const [failed, setFailed] = useState(false)
  const finalSrc = failed || !src ? PLACEHOLDER(fallbackLabel) : src
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}