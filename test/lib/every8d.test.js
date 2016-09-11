var expect = require('chai').expect;

var every8d = require('../../index').every8d;

var every8d = new every8d(config.every8d);

describe('every8d', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from every8d. every8d 測試簡訊. time ' + Date.now()
    }
    every8d.send(payload, function(result) {
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
    every8d.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})