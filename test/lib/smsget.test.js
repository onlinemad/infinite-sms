const expect = require('chai').expect
const debug = require('debug')('sms')

const Smsget = require('../../index').smsget

const smsget = new Smsget(config.smsget)

describe('smsget', async () => {
  it('success case', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`  // SMS-GET 不支援 emoji
    }
    let result = await smsget.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('missing destination', async () => {
    let payload = {
      to: '+886',
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`
    }
    let result = await smsget.send(payload)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter: scheduled sms', async () => {
    let today = new Date(Date.now() + 1000 * 60 * 5)
    let send_date = `${today.getFullYear()}/${('00' + (today.getMonth() + 1).toString()).slice(-2)}/${today.getDate()}`
    let hour = ('00' + (today.getHours()).toString()).slice(-2)
    let min = today.getMinutes().toString()
    let payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`,
      options: {
        method: '2',
        send_date: send_date,
        hour: hour,
        min: min
      }
    }
    let result = await smsget.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    let result = await smsget.balance()
    debug('smsget result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', async () => {
    let payload = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }
    let result = Smsget.receipt(payload)
    expect(result.id).to.equal('1783822')
    expect(result.provider).to.equal('smsget')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
  })
})
