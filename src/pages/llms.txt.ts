import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { disciplines } from '../content/disciplines'
import { person } from '../content/person'
import { sortCaseStudies } from '../lib/caseStudies'
import { llmsTxt } from '../lib/llmsTxt'

export const GET: APIRoute = async () =>
  new Response(
    llmsTxt({ person, disciplines, caseStudies: sortCaseStudies(await getCollection('caseStudies')), articles: await getCollection('blogArticles') }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
