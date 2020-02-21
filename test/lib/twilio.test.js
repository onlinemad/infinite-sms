const expect = require('chai').expect
const debug = require('debug')('sms')

const Twilio = require('../../index').twilio

const twilio = new Twilio(config.twilio)

describe('twilio', async () => {
  it('success case', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test from twilio. twilio 測試簡訊. 😀 time ${now()}`
    }
    let result = await twilio.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('missing destination', async () => {
    let payload = {
      to: '',
      text: `[operator] test from twilio. twilio 測試簡訊. 😀 time ${now()}`
    }
    let result = await twilio.send(payload)
    debug('twilio result', result)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        StatusCallback: config.twilio.options.StatusCallback
      }
    }
    let result = await twilio.send(payload)
    debug('twilio result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it.only('balance', async () => {
    let result = await twilio.balance()
    debug('twilio result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', () => {
    let payload = {
      SmsSid: 'SmsSid',
      SmsStatus: 'sent',
      MessageStatus: 'sent',
      To: '+123456789',
      MessageSid: 'SmsSid',
      AccountSid: 'AccountSid',
      From: '+123456789',
      ApiVersion: '2010-04-01'
    }
    let result = Twilio.receipt(payload)
    expect(result.id).to.equal('SmsSid')
    expect(result.provider).to.equal('twilio')
    expect(result.status).to.equal('sent')
    expect(result.raw).to.deep.equal(payload)
  })
})
