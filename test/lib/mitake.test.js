const expect = require('chai').expect

const Mitake = require('../../index').mitake

const mitake = new Mitake(config.mitake)

describe('mitake', () => {
  it('success case', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test for mitake. 測試簡訊 テスト 😀 time ${now()}`
    }
    mitake.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it.skip('missing destination', (done) => {
    const payload = {
      to: '+886',
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`
    }
    mitake.send(payload, (result) => {
      expect(result.status).to.equal('failed')
      done()
    })
  })
  it('optional parameter', (done) => {
    const payload = {
      to: config.fixture.to,
      text: `[operator] test from mitake 測試簡訊 テスト 😀 time ${now()}`,
      options: {
        response: config.mitake.options.response
      }
    }
    mitake.send(payload, (result) => {
      expect(result.status).to.equal('ok')
      expect(result.id).to.exist
      done()
    })
  })
  it('receipt', (done) => {
    const payload = { msgid: '$0005EF6C0',
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
    done()
  })
})
