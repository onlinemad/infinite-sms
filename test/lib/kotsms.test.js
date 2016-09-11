var expect = require('chai').expect;

var kotsms = require('../../index').kotsms;

var kotsms = new kotsms(config.kotsms);

describe('kotsms', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from kotsms. kotsms 測試簡訊. time ' + Date.now()
    }
    kotsms.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '+886',
      text: '[operator] test from kotsms. kotsms 測試簡訊. time ' + Date.now()
    }
    kotsms.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})