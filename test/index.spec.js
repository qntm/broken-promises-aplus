/* eslint-env mocha */

import assert from 'assert'
import promisesAplusTests from 'promises-aplus-tests'

import Promise from '../src/index.js'

// A bit hacky
const adapter = {
  deferred: () => {
    const promise = new Promise()
    promise.testInProgress = true
    return {
      promise,
      resolve: value => {
        promise._settle(1, value)
      },
      reject: reason => {
        promise._settle(2, reason)
      }
    }
  }
}

describe('broken-promises-aplus', () => {
  it('passes Promises/A+', function (done) {
    this.timeout(0)

    promisesAplusTests(adapter, { bail: true }, err => {
      if (err) {
        done(err)
      }
      done()
    })
  })

  it('fails in a real scenario', () => {
    assert.throws(() => new Promise().then(value => value))
  })
})
