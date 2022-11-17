const expect = require('chai').expect
const debug = require('debug')('sms')

const Ite2 = require('../../index').ite2

const ite2 = new Ite2(config.ite2)

describe('ite2', async () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for ite2 測試簡訊 テスト 😀 time ${now()}`
    }
    const result = await ite2.send(payload)
    debug('ite2 result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('missing destination', async () => {
    const payload = {
      to: '+886',
      text: `[operator] test for ite2 測試簡訊 テスト 😀 time ${now()}`
    }
    const result = await ite2.send(payload)
    debug('ite2 result', result)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter: scheduled sms', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for ite2 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        SCHEDULETIME: (new Date(Date.now() + 1000 * 60 * 6)).toLocaleString()
      }
    }
    const result = await ite2.send(payload)
    debug('ite2 result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    const result = await ite2.balance()
    debug('ite2 result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it.skip('receipt', (done) => {
    const payload = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }
    const result = ite2.receipt(payload)
    expect(result.id).to.equal('1783822')
    expect(result.provider).to.equal('ite2')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
    done()
  })
})
