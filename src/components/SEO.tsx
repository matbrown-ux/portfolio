import { Head } from 'vite-react-ssg'

export interface SEOProps {
  title: string
  description: string
  ogImage?: string
  type?: 'website' | 'article'
  schema?: object | object[]
  noindex?: boolean
}

export function computeSeo({
  title,
  description,
  type = 'website',
  noindex = false,
  ogImage,
  schema,
}: SEOProps) {
  const fullTitle = `${title} | Mathew Brown`
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []
  return { fullTitle, description, type, noindex, ogImage, schemas }
}

export function SEO(props: SEOProps) {
  const { fullTitle, description, type, noindex, ogImage, schemas } = computeSeo(props)

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
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
    </Head>
  )
}
