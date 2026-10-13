import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { htmlFiles, linkSources, linksIn, pageFacts, problemReport, SITE, siteProblems, sitemapFiles, sitemapUrls, urlForFile } from './rules.mjs'

const DIST = process.argv[2] ?? 'dist'

if (!existsSync(DIST)) {
  console.error(`check-dist: there is no ${DIST} folder. Run astro build first.`)
  process.exit(1)
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((item) => (item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]))
const read = (file) => readFileSync(join(DIST, file), 'utf8')

const files = walk(DIST).map((file) => relative(DIST, file))
const urlPaths = files.map(urlForFile)

const pages = htmlFiles(files).map((file) => pageFacts(read(file), SITE + urlForFile(file)))
const sitemap = new Set(sitemapFiles(files).flatMap((file) => sitemapUrls(read(file))))
const links = linkSources(urlPaths).map((path) => ({ file: path, urls: linksIn(read(path)) }))

const problems = siteProblems({ pages, sitemap, files: new Set(urlPaths), links })
const report = problemReport(problems, { pages: pages.length, listed: sitemap.size })

if (report.ok) console.log(report.text)
else {
  console.error(report.text)
  process.exit(1)
}
