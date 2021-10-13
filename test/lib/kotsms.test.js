const expect = require('chai').expect

const Kotsms = require('../../index').kotsms

const kotsms = new Kotsms(config.kotsms)

/**
 * 簡訊王 API document
 * https://www.kotsms.com.tw/index.php?selectpage=pagenews&kind=4&viewnum=238
 */
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
    kotsms.send(payload, function (result) {
      expect(result.status).to.equal('failed')
      done()
    })
  })
})