var expect = require('chai').expect;

var Mitake = require('../../index').mitake;

var mitake = new Mitake(config.mitake);

describe('mitake', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from mitake. mitake 測試簡訊 テスト. time ' + Date.now()
    }
    mitake.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '+886',
      text: '[operator] test from mitake. mitake 測試簡訊 テスト. time ' + Date.now()
    }
    mitake.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
  it('optional parameter', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from mitake. mitake 測試簡訊 テスト. time ' + Date.now(),
      options: {
        response: 'https://yourdimain/mitake/callback'
      }
    }
    mitake.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('receipt', function(done) {
    var payload = { msgid: '$0005EF6C0',
      dstaddr: '0919919919',
      dlvtime: '20160923141411',
      donetime: '20160923141415',
      statusstr: 'DELIVRD',
      statuscode: '0',
      StatusFlag: '4' 
    }
    var result = Mitake.receipt(payload);
    expect(result.id).to.equal('$0005EF6C0');
    expect(result.provider).to.equal('mitake');
    expect(result.status).to.equal('DELIVRD');
    expect(result.raw).to.deep.equal(payload);
    done();
  });
})