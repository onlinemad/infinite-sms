const expect = require('chai').expect
const debug = require('debug')('sms')

const Every8d = require('../../index').every8d

const every8d = new Every8d(config.every8d)

/**
 * every8d API document
 * https://www.teamplus.tech/product/every8d-download/
 */
describe('every8d', async () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from every8d. every8d 測試簡訊. time ${now()}`
    }
    const result = await every8d.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
    expect(result.response.batch).eq(result.id)
  })
  it('missing destination', async () => {
    const payload = {
      to: '',
      text: `[operator] test from nexmo. nexmo 測試簡訊. time ${now()}`
    }
    const result = await every8d.send(payload)
    expect(result.status).to.equal('failed')
  })
})