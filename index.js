'use strict'

const remark = require('remark')
const unified = require('unified')
const heading = require('mdast-util-heading-range')
const b = require('unist-builder')

const NEWLINE = '\n'
const DEFAULT_DEPTH = 2

module.exports = function (test, options) {
  options = options || {}

  const docProcessor = remark()
  const sibling = options.before || options.after
  const add = options.add || (sibling && options.add !== false)

  let index
  let numToRemove = 0
  let lines
  let eof

  const processor = unified()
    .use(attach('Parser', Parser))
    .use(attach('Compiler', Compiler))

  processor.document = docProcessor
  return processor

  function Parser (contents, file) {
    contents = contents.replace(/\r?\n/g, NEWLINE)
    eof = contents.slice(-1)
    contents = contents.trim()
    lines = contents.split(NEWLINE)

    const tree = docProcessor.parse(contents)
    const subtree = b('root', [])

    let found = false

    heading(tree, test, (start, nodes, end) => {
      if (found) return

      index = lineIndex(start)
      numToRemove = (end ? lineIndex(end) : lines.length) - index
      subtree.children = [start].concat(nodes)
      found = true
    })

    if (!found && add) {
      index = lines.length
      let depth = 0

      if (options.before) {
        heading(tree, options.before, (start) => {
          index = lineIndex(start)
          depth = start.depth
        })
      } else if (options.after) {
        heading(tree, options.after, (start, _, end) => {
          if (end) index = lineIndex(end)
          depth = start.depth
        })
      }

      const text = ensureString(options.text || test)
      const textNode = b('text', { value: text })

      depth = options.depth || depth || DEFAULT_DEPTH
      subtree.children = [b('heading', { depth }, [textNode])]
    }

    return subtree
  }

  function Compiler (subtree, file) {
    if (index !== undefined) {
      let md = docProcessor.stringify(subtree, file)
      if (index === lines.length) md = NEWLINE + md
      lines.splice(index, numToRemove, md)
    }

    const contents = lines.join(NEWLINE).trim()
    const suffix = eof === NEWLINE ? NEWLINE : ''

    return contents + suffix
  }
}

function ensureString (str) {
  if (typeof str !== 'string') {
    throw new TypeError('"options.text" or "test" must be a string')
  }

  return str
}

function attach (key, value) {
  return function () {
    this[key] = value
  }
}

function lineIndex (node) {
  // The lines array is 0-indexed, positions are 1-indexed.
  return node.position.start.line - 1
}
