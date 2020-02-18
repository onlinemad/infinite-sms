const expect = require('chai').expect

const Nexmo = require('../../index').nexmo

const nexmo = new Nexmo(config.nexmo)

describe('nexmo', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for nexmo 測試簡訊 テスト 😀 time ${now()}`
    }
    nexmo.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('missing destination', (done) => {
    const payload = {
      to: '',
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`
    }
    nexmo.send(payload, (result) => {
      expect(result.status).to.equal('failed')
      done()
    })
  })
  it('optional parameter', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        callback: config.nexmo.options.callback
      }
    }
    nexmo.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('receipt', (done) => {
    const payload = {
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
    const result = Nexmo.receipt(payload)
    expect(result.id).to.equal('06000000449DC552')
    expect(result.provider).to.equal('nexmo')
    expect(result.status).to.equal('delivered')
    expect(result.raw).to.deep.equal(payload)
    done()
  })
})
