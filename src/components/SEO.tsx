import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  ogImage?: string
  type?: 'website' | 'article'
  schema?: object | object[]
}

export function SEO({ title, description, ogImage, type = 'website', schema }: SEOProps) {
  const fullTitle = `${title} | Mathew Brown`
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
