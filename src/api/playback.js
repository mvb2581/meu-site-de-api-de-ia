export function youtubeEmbedUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    const host = parsed.hostname.toLowerCase()
    let videoId = ''

    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] || ''
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      videoId = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || ''
    }

    return /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
      : null
  } catch {
    return null
  }
}

export function embeddableEpisodes(streams = []) {
  return streams.flatMap((stream) => {
    const embedUrl = youtubeEmbedUrl(stream.url)
    const title = stream.title || ''
    const number = Number(title.match(/(?:episode|ep\.?|#)\s*#?\s*(\d+)/i)?.[1] || title.match(/^\s*(\d+)(?:[.:\s-]|$)/)?.[1]) || null
    return embedUrl && number ? [{ ...stream, number, embedUrl }] : []
  })
}
