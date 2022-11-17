const expect = require('chai').expect
const debug = require('debug')('sms')

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const Smsget = require('../../index').smsget

const smsget = new Smsget(config.smsget)

/**
 * SMS-GET API document
 * https://www.sms-get.com/api_desc.php
 */
describe('smsget', async () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`  // SMS-GET 不支援 emoji
    }
    const result = await smsget.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
    expect(result.response).to.exist
    expect(result.response.stats).true
  })
  it('missing destination', async () => {
    const payload = {
      to: '+886',
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`
    }
    const result = await smsget.send(payload)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter: scheduled sms', async () => {
    const scheduled_time = dayjs().add(5, 'm')
    const taipei_tiime = scheduled_time.tz('Asia/Taipei')
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget 測試簡訊 テスト time ${now()}`,
      options: {
        method: '2',
        send_date: taipei_tiime.format('YYYY/MM/DD'),
        hour: taipei_tiime.format('HH'),
        min: taipei_tiime.format('mm')
      }
    }
    const result = await smsget.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    const result = await smsget.balance()
    debug('smsget result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', async () => {
    const payload = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }
    const result = Smsget.receipt(payload)
    expect(result.id).to.equal('1783822')
    expect(result.provider).to.equal('smsget')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
  })
})

describe('smsget.bidirectional', async () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for smsget.bidirectional 測試簡訊 テスト time ${now()}`  // SMS-GET 不支援 emoji
    }
    const result = await smsget.bidirectional(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
})

describe('smsget.bidirectional_receipt', async () => {
  it('should parsing payload of provider webhook.', async () => {
    const payload = {
      content: '0919123456|1634110261249|2021-10-13 15:30:01|24%E6%B8%AC%E8%A9%A61529'
    }
    const result = Smsget.bidirectional_receipt(payload)
    debug(result)
    expect(result.id).eq('1634110261249')
    expect(result.provider).eq('smsget')
    expect(result.phone).eq('0919123456')
    expect(result.content).eq('24測試1529')
    expect(result.timestamp).eq(1634110201000)
    expect(result.raw).deep.equal(payload)
  })
})
