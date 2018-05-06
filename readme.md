# section-remark

> Specialized Remark that only transforms (or adds) one Markdown section.

[![npm status](http://img.shields.io/npm/v/section-remark.svg?style=flat-square)](https://www.npmjs.org/package/section-remark)
[![node](https://img.shields.io/node/v/section-remark.svg?style=flat-square)](https://www.npmjs.org/package/section-remark)
[![Build Status](https://secure.travis-ci.org/vweevers/section-remark.svg)](http://travis-ci.org/vweevers/section-remark)
[![Dependency status](https://img.shields.io/david/vweevers/section-remark.svg?style=flat-square)](https://david-dm.org/vweevers/section-remark)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

## Background

Remark works on an *abstract* syntax tree, which means some information is lost. Not semantics, but formatting, style, whitespace, i.e. your personal preferences. What's more, converting the AST back to markdown will *add* formatting and possibly result in unwanted diff noise.

Meant for sections of generated markdown, `section-remark` runs on a subset of the tree (a range of nodes starting with a certain header), stringifies it and concatenates the result with the rest of your markdown. Other sections are left alone.

Returns a `unified` processor, so like the regular `remark`, you can use [any plugin](https://github.com/remarkjs/remark/blob/master/doc/plugins.md).

## Usage

As an example, let's generate a Contributors section:

```js
const remark = require('section-remark')
const contributors = require('remark-contributors')
const report = require('vfile-reporter')
const vfile = require('to-vfile')

remark('Contributors')
  .use(contributors)
  .process(vfile.readSync('README.md'), function (err, file) {
    console.error(report(err || file))
    vfile.writeSync(file)
  })
```

This does nothing if the contributors section doesn't already exist. To either replace it or add it to the end of the document, do:

```js
remark('Contributors', { add: true })
```

To replace it or add it after another section:

```js
remark('Contributors', { after: 'API' })
```

We can use any `test` supported by [`mdast-util-heading-range`](https://github.com/syntax-tree/mdast-util-heading-range). If we want to generate an API section and insert it after a usage or example section:

```js
remark('API', { after: /^(usage|example)$/i })
```

Same goes for the first argument. If we want to replace or add a TOC:

```js
remark(/^(table of )?contents$/i, { add: true })
```

This will throw an error though if the TOC doesn't exist, because `section-remark` can't convert the regular expression to a title. We should define the `text` option, so that a "Contents" header will be renamed to "Table of Contents". And let's insert the TOC before another section.

```js
remark(/^(table of )?contents$/i, {
  text: 'Table of Contents',
  before: /^usage|example$/i
})
```

Lastly, if you use `before` or `after` and the section does not already exist, its header will inherit the depth of its `before` or `after` sibling.

## API

### `sectionRemark(test[, options])`

Returns a `unified` processor that transforms a section starting with a header which matches `test` (see [`mdast-util-heading-range`](https://github.com/syntax-tree/mdast-util-heading-range)). Options:

- `add`: add to end of document, if not found
- `before`: insert before section, if not found
- `after`: insert after section, if not found
- `text`: text content of header, defaults to `test` if a string
- `depth`: header depth, starting at 1, defaults to sibling depth or 2.

## Install

With [npm](https://npmjs.org) do:

```
npm install section-remark
```

## License

[MIT](http://opensource.org/licenses/MIT) © Vincent Weevers
