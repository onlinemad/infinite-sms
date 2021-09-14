const expect = require('chai').expect

const Every8d = require('../../index').every8d

const every8d = new Every8d(config.every8d)

/**
 * every8d API document
 * https://www.teamplus.tech/product/every8d-download/
 */
describe('every8d', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from every8d. every8d 測試簡訊. time ${now()}`
    }
    every8d.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('missing destination', (done) => {
    const payload = {
      to: '',
      text: `[operator] test from nexmo. nexmo 測試簡訊. time ${now()}`
    }
    every8d.send(payload, (result) => {
      expect(result.status).to.equal('failed')
      done()
    })
  })
})