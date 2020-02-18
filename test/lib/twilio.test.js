const expect = require('chai').expect

const Twilio = require('../../index').twilio

const twilio = new Twilio(config.twilio)

describe('twilio', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from twilio. twilio 測試簡訊. time ${now()}`
    }
    twilio.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('missing destination', (done) => {
    const payload = {
      to: '',
      text: `[operator] test from twilio. twilio 測試簡訊. time ${now()}`
    }
    twilio.send(payload, (result) => {
      expect(result.status).to.equal('failed')
      done()
    })
  })
  it('optional parameter', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        StatusCallback: config.twilio.options.StatusCallback
      }
    }
    twilio.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('receipt', (done) => {
    const payload = {
      SmsSid: 'SmsSid',
      SmsStatus: 'sent',
      MessageStatus: 'sent',
      To: '+123456789',
      MessageSid: 'SmsSid',
      AccountSid: 'AccountSid',
      From: '+123456789',
      ApiVersion: '2010-04-01'
    }
    const result = Twilio.receipt(payload)
    expect(result.id).to.equal('SmsSid')
    expect(result.provider).to.equal('twilio')
    expect(result.status).to.equal('sent')
    expect(result.raw).to.deep.equal(payload)
    done()
  })
})
