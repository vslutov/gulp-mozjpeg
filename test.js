import test from 'ava'
import File from 'vinyl'
import { stub } from 'sinon'
import through from 'through2'
import stream from 'stream'
import pify from 'pify'
import mozjpeg from 'mozjpeg'

const gulpMozjpeg = require('./index')
const execa = require('execa')

const getFakeFile = (fileContent, data) => {
  const result = new File({
    path: './test/fixture/file.png',
    cwd: './test/',
    base: './test/fixture/',
    contents: new Buffer.from(fileContent || '')
  })
  if (data != null) {
    result.data = data
  }
  return result
}

const getFakeFileReadStream = () =>
  new File({
    contents: new stream.Readable({ objectMode: true }).wrap(es.readArray(['Hello world'])),
    path: './test/fixture/anotherFile.png'
  })

test.serial('should call execa', pify((t, done) => {
  stub(execa, 'stdout').resolves(Buffer.from('some'))

  const inputContents = Buffer.from('hello')
  const inputFile = getFakeFile('hello')

  const inputStream = through.obj()
  const outputStream = inputStream.pipe(gulpMozjpeg())
  inputStream.end(inputFile)


  let fileCount = 0

  outputStream.on('data', outputFile => {
    t.truthy(outputFile)
    t.truthy(outputFile.path)
    t.truthy(outputFile.relative)
    t.truthy(outputFile.contents)
    t.is(outputFile.path, 'test/fixture/file.jpg')
    t.is(outputFile.relative, 'file.jpg')
    t.is(outputFile.contents.toString('utf8'), 'some')
    ++ fileCount
  })

  outputStream.on('end', () => {
    t.is(fileCount, 1)

    t.true(execa.stdout.calledOnce)

    const call = execa.stdout.firstCall
    t.true(execa.stdout.calledOnce)
    t.true(call.calledOn(execa))
    t.deepEqual(call.args, [
      mozjpeg,
      [],
      {
        encoding: null,
        input: inputContents,
        maxBuffer: Infinity
      }
    ])

    execa.stdout.restore()
    done()
  })
}))
