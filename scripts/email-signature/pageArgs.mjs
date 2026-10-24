/** Parses the copy page arguments into the base URL for the image links. */
export function parseBase(argv) {
  let base = 'https://matbrown.io'
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--base') {
      const value = argv[++i]
      if (!value) throw new Error('--base needs a URL')
      base = value
    } else if (arg.startsWith('--base=')) {
      const value = arg.slice('--base='.length)
      if (!value) throw new Error('--base needs a URL')
      base = value
    } else if (/^https:\/\//.test(arg)) {
      base = arg
    } else {
      throw new Error(`Unknown argument ${arg}. Use --base URL, --base=URL, or a bare https URL.`)
    }
  }
  return base
}
