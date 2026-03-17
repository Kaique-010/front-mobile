const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..')
const tmpRoot = path.join(projectRoot, '.tmp')
const jestCacheDir = path.join(tmpRoot, 'jest-cache')

fs.mkdirSync(jestCacheDir, { recursive: true })

process.env.TMP = tmpRoot
process.env.TEMP = tmpRoot
process.env.TMPDIR = tmpRoot
process.env.JEST_CACHE_DIRECTORY = jestCacheDir
process.env.CONSOLE_NINJA_DISABLE = '1'
process.env.DISABLE_CONSOLE_NINJA = '1'
process.env.WALLABY_DISABLE_CONSOLE_NINJA = '1'

const argv = process.argv.slice(2)
if (!argv.includes('--cacheDirectory')) {
  argv.push('--cacheDirectory', jestCacheDir)
}

require('jest').run(argv)
