var expect = require('chai').expect;

var mitake = require('../../index').mitake;

var mitake = new mitake(config.mitake);

describe('mitake', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from mitake. mitake 測試簡訊. time ' + Date.now()
    }
    mitake.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '',
      text: '[operator] test from mitake. mitake 測試簡訊. time ' + Date.now()
    }
    mitake.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})