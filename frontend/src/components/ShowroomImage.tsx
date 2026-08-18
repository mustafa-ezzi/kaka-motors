type Props = {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
  objectPosition?: string
  priority?: boolean
  className?: string
  decorative?: boolean
}

export function ShowroomImage({
  src,
  alt,
  srcSet,
  sizes = '(max-width: 768px) 100vw, 1200px',
  width = 1600,
  height = 1000,
  objectPosition = 'center',
  priority = false,
  className = '',
  decorative = false,
}: Props) {
  return (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={decorative ? '' : alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'async' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      style={{ objectPosition }}
    />
  )
}
