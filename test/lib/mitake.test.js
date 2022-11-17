const expect = require('chai').expect
const debug = require('debug')('sms')

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const Mitake = require('../../index').mitake

const mitake = new Mitake(config.mitake)

/**
 * 三竹 API document
 * https://sms.mitake.com.tw/common/index.jsp?t=1631608102452
 */
describe('mitake', () => {
  it('success case', async () => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for mitake. 測試簡訊 テスト 😀 time ${now()}`
    }
    const result = await mitake.send(payload)
    debug('mitake result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
    expect(result.response).to.exist
    expect(result.response.msgid).eq(result.id)
  })
  it.skip('missing destination', async () => {
    const payload = {
      to: '+886',
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`
    }
    const result = await mitake.send(payload)
    expect(result.status).to.equal('failed')
  })
  it.only('optional parameter: scheduled sms', async () => {
    // 預約發送：輸入的預約時間大於系統時間10分鐘
    const scheduled_time = dayjs().add(11, 'm')
    const send_date = scheduled_time.tz('Asia/Taipei').format('YYYYMMDDHHmm00')
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        dlvtime: send_date
      }
    }
    const result = await mitake.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    const result = await mitake.balance()
    debug('mitake result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', () => {
    const payload = {
      msgid: '$0005EF6C0',
      dstaddr: '0919919919',
      dlvtime: '20160923141411',
      donetime: '20160923141415',
      statusstr: 'DELIVRD',
      statuscode: '0',
      StatusFlag: '4'
    }
    const result = Mitake.receipt(payload)
    expect(result.id).to.equal('$0005EF6C0')
    expect(result.provider).to.equal('mitake')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
  })
})
