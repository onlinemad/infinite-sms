var expect = require('chai').expect;

var smsget = require('../../index').smsget;

var smsget = new smsget(config.smsget);

describe('smsget', function() {
  it('send', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from smsget. smsget 測試簡訊. time ' + Date.now()
    }
    smsget.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '+886',
      text: '[operator] test from smsget. smsget 測試簡訊. time ' + Date.now()
    }
    smsget.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})