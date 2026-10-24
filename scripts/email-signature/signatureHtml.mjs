import { person } from '../../src/content/person.ts'
import nameSize from './nameSize.json' with { type: 'json' }

const SITE = 'https://matbrown.io'
// Mid gray: readable on white and on #1f1f1f.
const GRAY = '#808080'
const VERMILION = '#f86343'
const MONO = "Menlo, Consolas, 'Courier New', monospace"
const SANS = 'Arial, Helvetica, sans-serif'

/** Escapes text and attribute values. */
const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** An image that links to a page, with every attribute email clients need. */
function linkedImage(href, src, alt, width, height, extraStyle = '') {
  return `<a href="${esc(href)}" target="_blank" style="text-decoration:none;border:0"><img src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}" style="display:block;border:0;${extraStyle}"></a>`
}

/**
 * The signature as one inline-styled table, for pasting into Gmail.
 * @param {string} base The https origin that serves /email/v1/*.gif.
 * @returns {string}
 */
export function renderSignature(base) {
  if (!/^https:\/\//.test(base)) throw new Error(`Signature base must be https, got "${base}"`)
  const root = base.replace(/\/+$/, '')
  const nameWidth = Math.round(nameSize.width / 2)
  const nameHeight = Math.round(nameSize.height / 2)
  const profile = (label) => person.profiles.find((p) => p.label === label)
  const linkedin = profile('LinkedIn')
  const github = profile('GitHub')
  if (!linkedin || !github) throw new Error('person.ts needs LinkedIn and GitHub profiles')

  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:0">
<tr><td style="padding:0">${linkedImage(SITE, `${root}/email/v1/name.gif`, 'Mat Brown', nameWidth, nameHeight)}</td></tr>
<tr><td style="padding:8px 0 0 0;font-family:${MONO};font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${GRAY}">UX Engineer | SEO Nerd</td></tr>
<tr><td style="padding:4px 0 0 0;font-family:${SANS};font-size:14px;line-height:18px"><a href="${SITE}" target="_blank" style="color:${GRAY};text-decoration:underline;text-decoration-color:${VERMILION}">matbrown.io</a></td></tr>
<tr><td style="padding:12px 0 0 0"><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:0"><tr>
<td style="padding:0">${linkedImage(linkedin.href, `${root}/email/v1/linkedin.gif`, 'LinkedIn', 24, 24)}</td>
<td width="8" style="padding:0;width:8px;font-size:0;line-height:0">&nbsp;</td>
<td style="padding:0">${linkedImage(github.href, `${root}/email/v1/github.gif`, 'GitHub', 24, 24)}</td>
</tr></table></td></tr>
</table>`
}
