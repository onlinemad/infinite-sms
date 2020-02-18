const expect = require('chai').expect

const Smsget = require('../../index').smsget

const smsget = new Smsget(config.smsget)

describe('smsget', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`
    }
    smsget.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('missing destination', (done) => {
    const payload = {
      to: '+886',
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`
    }
    smsget.send(payload, (result) => {
      expect(result.status).to.equal('failed')
      done()
    })
  })
  it('optional parameter', (done) => {
    const today = new Date()
    const send_date = today.getFullYear() + '/' + ('00' + (today.getMonth() + 1).toString()).slice(-2) + '/' + today.getDate()
    const hour = ('00' + (today.getHours() + 1).toString()).slice(-2)
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`,
      options: {
        method: '2',
        send_date: send_date,
        hour: hour,
        min: '00'
      }
    }
    smsget.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('receipt', (done) => {
    const payload = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }
    const result = Smsget.receipt(payload)
    expect(result.id).to.equal('1783822')
    expect(result.provider).to.equal('smsget')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
    done()
  })
})
