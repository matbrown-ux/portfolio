export function personSchema(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name,
    url,
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

export function serviceSchema(name: string, description: string, provider: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service' as const,
    name,
    description,
    provider: {
      '@type': 'Person' as const,
      name: provider,
    },
  }
}
