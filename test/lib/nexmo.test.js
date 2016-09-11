var expect = require('chai').expect;

var nexmo = require('../../index').nexmo;

var nexmo = new nexmo(config.nexmo);

describe('nexmo', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from nexmo. nexmo 測試簡訊. time ' + Date.now()
    }
    nexmo.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '',
      text: '[operator] test from nexmo. nexmo 測試簡訊. time ' + Date.now()
    }
    nexmo.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})