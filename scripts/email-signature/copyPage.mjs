import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderSignature } from './signatureHtml.mjs'
import { parseBase } from './pageArgs.mjs'

const base = parseBase(process.argv.slice(2))
const signature = renderSignature(base)

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Email signature</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;margin:32px;color:#111">
<h1 style="font-size:20px;margin:0 0 8px 0">Email signature</h1>
<p style="margin:0 0 24px 0">Select the signature below, copy it, then paste it into Gmail under Settings, then See all settings, then Signature.</p>
<div style="padding:24px;border:1px solid #ccc;display:inline-block">
${signature}
</div>
</body>
</html>
`

const out = fileURLToPath(new URL('../../.email-signature/index.html', import.meta.url))
mkdirSync(new URL('../../.email-signature/', import.meta.url), { recursive: true })
writeFileSync(out, page)
console.log(`Wrote ${out} (base ${base}, signature ${signature.length} characters)`)
