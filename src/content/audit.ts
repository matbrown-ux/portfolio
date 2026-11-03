/**
 * The audit offer on /services/audit: a paid first step before a build (the owner, 2026-11-02).
 * Price, length and the credit window are the owner's. Copy is first person.
 */
export interface AuditVersion {
  slug: string
  name: string
  /** Who the version is for, one line. */
  audience: string
  blurb: string
  looksAt: string[]
}

export interface AuditStep {
  title: string
  text: string
}

export interface AuditFaq {
  question: string
  answer: string
}

export interface AuditProof {
  title: string
  text: string
  href: string
  /** The label above the title. */
  kind: string
  /** The link's label at the foot of the card. */
  cta: string
}

export const audit = {
  path: '/services/audit',
  /** The ?service= value on /contact. */
  slug: 'audit',
  title: 'AI and website audit',
  headline: 'AI Automation & Website Audits for Startups and Hospitality',
  summary:
    'A two week audit of your website, your booking flow and the work your team does by hand every day. You get a written plan that ranks every fix by what pays you back first, with a cost next to each one.',
  price: 3500,
  priceLabel: '$3,500',
  length: 'Two weeks',
  creditDays: 60,
} as const

export const auditIntro: string[] = [
  "Most business owners I talk to can tell something's off, but they're not sure what, so they guess. And a guess with a $20,000 build attached to it is a seriously expensive guess.",
  'The audit takes the guessing out. For two weeks I go through how your business really runs: your website, your booking flow, your tools and the stuff your team does by hand every single day.',
  'Then I write you a plan that ranks every fix and every automation by what pays you back first, with a cost next to each one. You decide where the money goes before anyone writes a line of code, and that is the whole point.',
]

export const auditVersions: AuditVersion[] = [
  {
    slug: 'startups',
    name: 'Startups',
    audience: 'Founders with a product, or one on the way',
    blurb: "You've got a runway and a long list of ideas for spending it. I look at your product and your site the way a brand new customer meets them, because that person decides whether you grow.",
    looksAt: [
      "How your product feels to use, from sign up to the moment it's useful",
      "How you show up on Google and in AI answers, like ChatGPT and Google's AI Overviews",
      "Manual work an AI agent could take off your team's plate",
      "Your tech stack, and what it'll cost you to grow on it",
    ],
  },
  {
    slug: 'hospitality',
    name: 'Tourism & hospitality',
    audience: "Tour operators, hotels, restaurants and activity companies in Hawai'i",
    blurb: "Your site probably looks great, honestly, right up until a guest tries to book something. I find where guests give up before they pay and where your staff are stuck waiting on you for answers.",
    looksAt: [
      'Your booking flow, from the first click to the payment',
      'Your Google Business Profile and how you show up in local search',
      'The questions your staff ask you every day that an AI assistant could answer for them',
      'Admin work, like sorting expenses and pulling reports, that could run on its own',
    ],
  },
]

export const auditDeliverables: string[] = [
  'A written plan that ranks every fix by what pays you back first',
  'A cost and a timeline for each item, so you can budget before you commit',
  'A 60 minute call where I walk you through the whole thing',
  'Notes detailed enough that any developer could build from them',
]

export const auditSteps: AuditStep[] = [
  { title: 'Free call', text: "We talk for 30 minutes about your business and what's slowing it down. If an audit won't help you, I'll tell you straight up and save us both the time." },
  { title: 'Two weeks of digging', text: 'I go through your site, your tools and your numbers, and I talk with the people who do the work, because they always know where the time goes.' },
  { title: 'The plan', text: 'You get the written plan, and we go through it together on a call so nothing in it is a mystery.' },
  { title: 'The build, if you want it', text: 'If you want me to build it and we start within 60 days, the audit fee comes off the build price.' },
]

export const auditProof: AuditProof[] = [
  {
    kind: 'Running on this site',
    title: 'My article pipeline',
    text: "I built a team of AI agents that research, write, illustrate and edit the articles on my blog. A new one is ready three times a week, and I read every one before it goes live, because the preschool version of AI publishes whatever comes back.",
    href: '/blog',
    cta: 'Read the blog',
  },
  {
    kind: 'Case study',
    title: 'The Booking Flow',
    text: 'My own software product for service businesses. It replies to every lead the moment it comes in, books the estimate and follows up on its own, so nobody has to remember to.',
    href: '/work/the-booking-flow',
    cta: 'Read the case study',
  },
  {
    kind: 'Case study',
    title: "'Aiwi Waffles",
    text: "I built Home Base, the shop's private dashboard for sales, team and training. Now I'm adding an AI assistant that answers staff questions from the shop's own guide.",
    href: '/work/aiwi-waffles',
    cta: 'Read the case study',
  },
]

export const auditFaqs: AuditFaq[] = [
  {
    question: 'Do I have to hire you for the build?',
    answer: 'Nope. I write the plan so you can hand it to any developer or agency you like. If you do hire me within 60 days, the audit fee comes off the build.',
  },
  {
    question: "What if AI isn't the answer for my business?",
    answer: "Then the plan says so. Sometimes the best fix is a faster booking page or a cleaner Google listing, and I'd much rather tell you that than sell you an AI agent you don't need. An agent with nothing useful to do is basically a very expensive pet.",
  },
  {
    question: 'What do you need from me?',
    answer: "An hour for our first call, access to your site and the tools you use, and a quick chat with whoever on your team knows where the time goes. That person always exists, and it's usually not the owner.",
  },
  {
    question: 'Can a larger business get an audit?',
    answer: "Absolutely. The $3,500 price covers one business with one location or one product. If you've got several, I'll scope it and quote you after our first call.",
  },
]
