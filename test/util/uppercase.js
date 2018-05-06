'use strict'

const visit = require('unist-util-visit')

module.exports = function attach () {
  return function transform (tree) {
    visit(tree, 'text', function (node, index, parent) {
      node.value = node.value.toUpperCase()
    })
  }
}
