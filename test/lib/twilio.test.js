const expect = require('chai').expect
const debug = require('debug')('sms')

const Twilio = require('../../index').twilio

const twilio = new Twilio(config.twilio)

/**
 * Twilio API document
 * https://www.twilio.com/docs/usage/api
 */
describe('twilio', async () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from twilio. twilio 測試簡訊. 😀 time ${now()}`
    }
    const result = await twilio.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
    expect(result.response).to.exist
    expect(result.response.sid).eq(result.id)
  })
  it('missing destination', async () => {
    const payload = {
      to: '',
      text: `[operator] test from twilio. twilio 測試簡訊. 😀 time ${now()}`
    }
    const result = await twilio.send(payload)
    debug('twilio result', result)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from nexmo 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        StatusCallback: config.twilio.options.StatusCallback
      }
    }
    const result = await twilio.send(payload)
    debug('twilio result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    const result = await twilio.balance()
    debug('twilio result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', () => {
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
  })
})
