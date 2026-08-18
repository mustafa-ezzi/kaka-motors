export type VehicleCategory = 'performance' | 'electric' | 'executive'
export type VehicleStatus = 'draft' | 'published' | 'archived'
export type GalleryKind = 'image' | 'video'

export type GalleryMedia = {
  id: string
  kind: GalleryKind
  imageUrl: string
  alt: string
  objectPosition?: string
  imageSrcSet?: string
  sortOrder: number
  label?: string
}

export type Vehicle = {
  id: string
  slug: string
  name: string
  category: VehicleCategory
  statusLabel: string
  summary: string
  description: string
  interiorStory?: string
  priceFrom?: number
  currency: string
  heroImageUrl: string
  heroSrcSet?: string
  heroObjectPosition?: string
  cardImageUrl: string
  cardSrcSet?: string
  gallery: GalleryMedia[]
  specs: {
    power: string
    acceleration: string
    topSpeed: string
    transmission?: string
    weightBias?: string
    length?: string
  }
  features: string[]
  sortOrder: number
  featuredOnHome: boolean
  status: VehicleStatus
  accent?: string
}

export type SiteContent = {
  homeEyebrow: string
  homeHeadline: string
  homeCtaLabel: string
  homeNarrative: string
  aboutIntro: string
  founderQuote: string
  founderName: string
  brandHistory: string
  values: { title: string; body: string }[]
  studioBlurb: string
  responseTimeCopy: string
  testDriveIntro?: string
  privacyCopy?: string
}
