import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { extraBlogSections } from '../../content/blogSections'
import { disciplines } from '../../content/disciplines'
import { blogSections } from '../../lib/blogSections'
import { renderCard } from '../../lib/cardRender'
import { cardParam, shareCards, type ShareCard } from '../../lib/shareCards'

// One PNG per page that has its own share card. Card URLs mirror page URLs.
export const getStaticPaths: GetStaticPaths = async () => {
  const cards = shareCards({
    sections: blogSections(disciplines, extraBlogSections),
    caseStudies: await getCollection('caseStudies'),
    topics: await getCollection('blogTopics'),
    articles: await getCollection('blogArticles'),
  })
  return cards.map((card) => ({ params: { path: cardParam(card.path) }, props: { card } }))
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderCard(props.card as ShareCard)), { headers: { 'Content-Type': 'image/png' } })
