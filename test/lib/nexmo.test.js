const expect = require('chai').expect
const debug = require('debug')('sms')

const Nexmo = require('../../index').nexmo

const nexmo = new Nexmo(config.nexmo)

describe('nexmo', async () => {
  it('success case', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test for nexmo 測試簡訊 テスト 😀 time ${now()}`
    }
    let result = await nexmo.send(payload)
    debug('nexmo result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('missing destination', async () => {
    let payload = {
      to: '',
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`
    }
    let result = await nexmo.send(payload)
    debug('nexmo result', result)
    expect(result.status).to.equal('failed')
  })
  it('balance', async () => {
    let result = await nexmo.balance()
    debug('nexmo result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('optional parameter', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        callback: config.nexmo.options.callback
      }
    }
    let result = await nexmo.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('receipt', () => {
    let payload = {
      msisdn: '886919919919',
      to: '889989666777',
      'network-code': '46697',
      messageId: '06000000449DC552',
      price: '0.03580000',
      status: 'delivered',
      scts: '1609111016',
      'err-code': '0',
      'message-timestamp': '2016-09-11 10:17:39'
    }
    let result = Nexmo.receipt(payload)
    expect(result.id).to.equal('06000000449DC552')
    expect(result.provider).to.equal('nexmo')
    expect(result.status).to.equal('delivered')
    expect(result.raw).to.deep.equal(payload)
  })
})
