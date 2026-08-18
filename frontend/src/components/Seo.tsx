import { useEffect } from 'react'

type Props = {
  title: string
  description: string
  path: string
  image?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let node = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!node) {
    node = document.createElement('meta')
    document.head.appendChild(node)
  }
  Object.entries(attrs).forEach(([key, value]) => node?.setAttribute(key, value))
}

function upsertLink(rel: string, href: string) {
  let node = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!node) {
    node = document.createElement('link')
    node.rel = rel
    document.head.appendChild(node)
  }
  node.href = href
}

export function Seo({ title, description, path, image, jsonLd }: Props) {
  const serialized = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const origin = window.location.origin
    const url = `${origin}${path}`
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    }
    upsertLink('canonical', url)

    const existing = document.getElementById('km-jsonld')
    if (existing) existing.remove()
    if (serialized) {
      const script = document.createElement('script')
      script.id = 'km-jsonld'
      script.type = 'application/ld+json'
      script.text = serialized
      document.head.appendChild(script)
    }

    return () => {
      document.getElementById('km-jsonld')?.remove()
    }
  }, [title, description, path, image, serialized])

  return null
}

export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'AutoDealer'],
  name: 'Kaka Motors',
  url: typeof window === 'undefined' ? 'https://kakamotors.pk' : window.location.origin,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Karachi',
    addressCountry: 'PK',
  },
}
