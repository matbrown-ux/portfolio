/**
 * The five service disciplines: the single source for the Home "What I do" strip
 * and for Services, About and the Contact project-type select.
 * Blurbs are first person. Every line is a draft until the owner approves it.
 */
export interface Discipline {
  number: string
  /** Anchor id on /services and the ?service= value on /contact. */
  slug: string
  title: string
  /** One line for Home "What I do". */
  blurb: string
  deliverables: string[]
  cta: string
  skills: string[]
  /** Case study that proves this discipline. */
  proofSlug?: string
}

export const disciplines: Discipline[] = [
  {
    number: '01',
    slug: 'ux-ui-engineering',
    title: 'UX/UI Engineering',
    blurb: 'I design interfaces and build them myself in production React, so nothing gets lost between design and code.',
    deliverables: [
      'Design system and component library',
      'Responsive, accessible React implementation',
      'Figma designs built in code as designed',
      'Interaction design and prototyping',
    ],
    cta: 'Start a UI project',
    skills: [
      'Design systems & component libraries',
      'Production-quality React',
      'Figma-to-code',
      'Accessibility (WCAG AA)',
      'Interaction design',
      'Responsive layout',
    ],
    proofSlug: 'vamp-network',
  },
  {
    number: '02',
    slug: 'seo-aeo',
    title: 'SEO/AEO',
    blurb: 'I fix the technical foundations and structure your content so rankings build over time.',
    deliverables: [
      'Technical SEO audit and fixes',
      'Pillar and cluster content architecture',
      'Schema markup implementation',
      'Core Web Vitals optimization',
    ],
    cta: 'Improve my SEO',
    skills: [
      'Technical SEO audits',
      'Core Web Vitals',
      'Pillar/cluster architecture',
      'Schema markup',
      'Keyword strategy',
      'Content architecture',
    ],
    proofSlug: 'aiwi-waffles',
  },
  {
    number: '03',
    slug: 'agentic-workflows',
    title: 'Agentic Workflows',
    blurb: 'I build AI agents on Claude and the AI SDK that do real work in your business.',
    deliverables: [
      'Workflow design and scoping',
      'Claude API and AI SDK integration',
      'MCP server development',
      'Deployment and monitoring',
    ],
    cta: 'Automate my workflows',
    skills: [
      'Claude API & AI SDK',
      'MCP server development',
      'Prompt engineering',
      'Automation pipelines',
      'Tool integration',
      'Workflow design',
    ],
    proofSlug: 'the-booking-flow',
  },
  {
    number: '04',
    slug: 'brand-development',
    title: 'Brand Development',
    blurb: 'I design brand identities that hold together across logo, signage and merch.',
    deliverables: [
      'Logo and visual identity system',
      'Brand messaging and voice',
      'Signage and physical touchpoints',
      'Merchandise design',
    ],
    cta: 'Build my brand',
    skills: ['Logo design', 'Visual identity systems', 'Brand messaging', 'Signage', 'Merchandise design', 'Graphic design'],
    proofSlug: 'aiwi-waffles',
  },
  {
    number: '05',
    slug: 'saas-development',
    title: 'SaaS Development',
    blurb: 'I build SaaS products: the marketing site, the dashboard and the integrations behind them.',
    deliverables: [
      'Marketing site and product UI',
      'Custom dashboards on React, Vite and Supabase',
      'Authentication with Google OAuth',
      'Third-party API integrations',
    ],
    cta: 'Build my SaaS',
    skills: ['React & Vite', 'Supabase', 'Authentication', 'API integrations', 'Dashboard design', 'Marketing sites'],
    proofSlug: 'the-booking-flow',
  },
]
