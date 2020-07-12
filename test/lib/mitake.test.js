const expect = require('chai').expect
const debug = require('debug')('sms')

const Mitake = require('../../index').mitake

const mitake = new Mitake(config.mitake)

describe('mitake', () => {
  it('success case', async () => {
    let payload = {
      to: config.fixture.to,
      text: `[operator] test for mitake. 測試簡訊 テスト 😀 time ${now()}`
    }
    let result = await mitake.send(payload)
    debug('mitake result', result)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it.skip('missing destination', async () => {
    let payload = {
      to: '+886',
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`
    }
    let result = await mitake.send(payload)
    expect(result.status).to.equal('failed')
  })
  it('optional parameter: scheduled sms', async () => {
    let today = new Date(Date.now() + 1000 * 60 * 11)
    let send_date = `${today.getFullYear()}${('00' + (today.getMonth() + 1).toString()).slice(-2)}${today.getDate()}${('00' + (today.getHours()).toString()).slice(-2)}${today.getMinutes().toString()}00`
    let payload = {
      to: config.fixture.to,
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        dlvtime: send_date
      }
    }
    let result = await mitake.send(payload)
    expect(result.status).to.equal('ok')
    expect(result.id).to.exist
  })
  it('balance', async () => {
    let result = await mitake.balance()
    debug('mitake result', result)
    expect(result.status).to.equal('ok')
    expect(result.balance).to.exist
  })
  it('receipt', () => {
    let payload = { msgid: '$0005EF6C0',
      dstaddr: '0919919919',
      dlvtime: '20160923141411',
      donetime: '20160923141415',
      statusstr: 'DELIVRD',
      statuscode: '0',
      StatusFlag: '4'
    }
    let result = Mitake.receipt(payload)
    expect(result.id).to.equal('$0005EF6C0')
    expect(result.provider).to.equal('mitake')
    expect(result.status).to.equal('DELIVRD')
    expect(result.raw).to.deep.equal(payload)
  })
})
