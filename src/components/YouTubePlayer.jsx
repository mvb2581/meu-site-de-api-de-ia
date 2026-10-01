import { useEffect, useRef, useState } from 'react'

let apiPromise

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    let timeout
    const previousReady = window.onYouTubeIframeAPIReady
    const ready = () => {
      window.clearTimeout(timeout)
      try {
        if (typeof previousReady === 'function') previousReady()
      } catch {
        // A callback from another integration must not block player initialization.
      }
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('O player do YouTube não ficou disponível.'))
    }
    window.onYouTubeIframeAPIReady = ready

    let script = document.querySelector('script[data-aurex-youtube-api]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.aurexYoutubeApi = 'true'
      script.onerror = () => {
        window.clearTimeout(timeout)
        reject(new Error('Não foi possível carregar o player do YouTube.'))
      }
      document.head.appendChild(script)
    }

    timeout = window.setTimeout(() => reject(new Error('O player demorou para responder.')), 15000)
  }).catch((error) => {
    apiPromise = null
    throw error
  })
  return apiPromise
}

const PLAYER_ERRORS = {
  2: 'O vídeo tem um identificador inválido.',
  5: 'O vídeo não pôde ser reproduzido neste navegador.',
  100: 'Este vídeo foi removido ou está privado.',
  101: 'O responsável pelo vídeo bloqueou a incorporação.',
  150: 'O responsável pelo vídeo bloqueou a incorporação.',
  153: 'O provedor não autorizou a reprodução neste contexto.'
}

export default function YouTubePlayer({ videoId, title, initialPosition = 0, onProgress, onEnded }) {
  const mountRef = useRef(null)
  const onProgressRef = useRef(onProgress)
  const onEndedRef = useRef(onEnded)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])

  useEffect(() => {
    let cancelled = false
    let player
    let progressTimer
    setReady(false)
    setError('')

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return
      const target = document.createElement('div')
      mountRef.current.replaceChildren(target)

      player = new YT.Player(target, {
        width: '100%',
        height: '100%',
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: ({ target: activePlayer }) => {
            if (cancelled) return
            setReady(true)
            if (initialPosition > 0) activePlayer.seekTo(initialPosition, true)
            activePlayer.playVideo()
            progressTimer = window.setInterval(() => {
              const duration = activePlayer.getDuration()
              const position = activePlayer.getCurrentTime()
              if (duration > 0 && Number.isFinite(position)) onProgressRef.current?.({ position, duration })
            }, 5000)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              const duration = event.target.getDuration()
              const position = event.target.getCurrentTime()
              if (duration > 0) onProgressRef.current?.({ position, duration })
            }
            if (event.data === YT.PlayerState.ENDED) onEndedRef.current?.()
          },
          onError: (event) => {
            setError(PLAYER_ERRORS[event.data] || 'Este vídeo não está disponível para reprodução.')
          }
        }
      })
    }).catch((reason) => {
      if (!cancelled) setError(reason.message || 'Não foi possível carregar o player.')
    })

    return () => {
      cancelled = true
      window.clearInterval(progressTimer)
      try {
        const duration = player?.getDuration?.()
        const position = player?.getCurrentTime?.()
        if (duration > 0 && Number.isFinite(position)) onProgressRef.current?.({ position, duration })
        player?.destroy()
      } catch {
        // O iframe pode ter sido removido pelo navegador antes do componente desmontar.
      }
      mountRef.current?.replaceChildren()
    }
  }, [videoId, initialPosition])

  return (
    <div className="au-youtube-player ratio ratio-16x9" aria-label={title}>
      <div ref={mountRef} className="au-youtube-api-target" />
      {!ready && !error && (
        <div className="au-player-loading" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Carregando vídeo…</span>
        </div>
      )}
      {error && (
        <div className="au-player-error" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
