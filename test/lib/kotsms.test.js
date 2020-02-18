const expect = require('chai').expect

const kotsms = require('../../index').kotsms

const kotsms = new kotsms(config.kotsms)

describe('kotsms', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from kotsms. kotsms 測試簡訊. time ${now()}`
    }
    kotsms.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('missing destination', (done) => {
    const payload = {
      to: '+886',
      text: `[operator] test from kotsms. kotsms 測試簡訊. time ${now()}`
    }
    kotsms.send(payload, function(result) {
      expect(result.status).to.equal('failed')
      done()
    })
  })
})