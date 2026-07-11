export function personSchema(
  name: string,
  url: string,
  extras?: { jobTitle?: string; sameAs?: string[]; knowsAbout?: string[] }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name,
    url,
    ...(extras?.jobTitle ? { jobTitle: extras.jobTitle } : {}),
    ...(extras?.sameAs ? { sameAs: extras.sameAs } : {}),
    ...(extras?.knowsAbout ? { knowsAbout: extras.knowsAbout } : {}),
  }
}

export function websiteSchema(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name,
    url,
    publisher: { '@type': 'Person' as const, name },
  }
}

export function serviceOfferSchema(input: {
  name: string
  description: string
  provider: string
  minPrice: number
  priceCurrency?: string
}) {
  // A recurring "from $X/month" offer expressed with a numeric minPrice and a
  // monthly reference quantity, so it validates cleanly (a free-form price
  // string like "from $3,000/mo" is rejected by structured-data validators).
  return {
    '@context': 'https://schema.org',
    '@type': 'Service' as const,
    name: input.name,
    description: input.description,
    provider: { '@type': 'Person' as const, name: input.provider },
    offers: {
      '@type': 'Offer' as const,
      priceSpecification: {
        '@type': 'UnitPriceSpecification' as const,
        minPrice: input.minPrice,
        priceCurrency: input.priceCurrency ?? 'USD',
        referenceQuantity: {
          '@type': 'QuantitativeValue' as const,
          value: 1,
          unitCode: 'MON',
        },
      },
    },
  }
}

export function articleSchema({
  title,
  description,
  datePublished,
  url,
}: {
  title: string
  description: string
  datePublished: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article' as const,
    headline: title,
    description,
    datePublished,
    url,
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem' as const,
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
