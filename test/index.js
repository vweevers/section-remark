'use strict'

const test = require('tape')
const contributors = require('remark-contributors')
const fs = require('fs')
const path = require('path')
const remark = require('..')
const uppercase = require('./util/uppercase')

const INPUT = fixture('input.md')

test('example (replace)', function (t) {
  const output = remark('example')
    .use(uppercase)
    .processSync(INPUT).contents

  t.is(output, fixture('example (replace).md'))
  t.end()
})

test('example (replace) (without newline EOF)', function (t) {
  const output = remark('example')
    .use(uppercase)
    .processSync(INPUT.trim()).contents

  t.is(output, fixture('example (replace).md').trim())
  t.end()
})

test('after example', function (t) {
  const output = remark('new', { after: /example/i })
    .processSync(INPUT).contents

  t.is(output, fixture('after example.md'))
  t.end()
})

test('before example', function (t) {
  const output = remark('TOC', { before: /example/i, text: 'toc' })
    .processSync(INPUT).contents

  t.is(output, fixture('before example.md'))
  t.end()
})

test('end of document (replace)', function (t) {
  const output = remark(/end of doc/i)
    .use(uppercase)
    .processSync(INPUT).contents

  t.is(output, fixture('end of document (replace).md'))
  t.end()
})

test('end of document (add)', function (t) {
  const output = remark('new', { add: true })
    .use(uppercase)
    .processSync(INPUT).contents

  t.is(output, fixture('end of document (add).md'))
  t.end()
})

test('end of document (add) (without newline EOF)', function (t) {
  const output = remark('new', { add: true })
    .use(uppercase)
    .processSync(INPUT.trim()).contents

  t.is(output, fixture('end of document (add).md').trim())
  t.end()
})

test('before end of document', function (t) {
  const output = remark('new', { before: 'End of document' })
    .use(uppercase)
    .processSync(INPUT).contents

  t.is(output, fixture('before end of document.md'))
  t.end()
})

test('after end of document', function (t) {
  const output = remark('new', { after: 'End of document' })
    .use(uppercase)
    .processSync(INPUT).contents

  t.is(output, fixture('after end of document.md'))
  t.end()
})

test('after end of document (with depth)', function (t) {
  const output = remark('new', { after: 'End of document', depth: 1 })
    .processSync(INPUT).contents

  t.is(output, fixture('after end of document (with depth).md'))
  t.end()
})

test('table reformatting', function (t) {
  const output = remark(/table/)
    .processSync(INPUT).contents

  t.is(output, fixture('table reformatting.md'))
  t.end()
})

test('remark-contributors (replace)', function (t) {
  const output = remark('Contributors')
    .use(contributors, {
      contributors: [{
        name: 'Test',
        github: 'test'
      }]
    })
    .processSync(INPUT).contents

  t.is(output, fixture('remark-contributors (replace).md'))
  t.end()
})

test('remark-contributors (add)', function (t) {
  const output = remark(/new/, { add: true, text: 'contributors' })
    .use(contributors, {
      contributors: [{
        name: 'Test',
        github: 'test'
      }]
    })
    .processSync(INPUT).contents

  t.is(output, fixture('remark-contributors (add).md'))
  t.end()
})

test('remark-contributors (noop)', function (t) {
  const output = remark(/nope/)
    .use(contributors, {
      contributors: [{
        name: 'Test',
        github: 'test'
      }]
    })
    .processSync(INPUT).contents

  t.is(output, INPUT)
  t.end()
})

function fixture (file) {
  const fp = path.join(__dirname, 'fixtures', file)
  return fs.readFileSync(fp, 'utf8')
}
