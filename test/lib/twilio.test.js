var expect = require('chai').expect;

var twilio = require('../../index').twilio;

var twilio = new twilio(config.twilio);

describe('twilio', function() {
  it('success case', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from twilio. twilio 測試簡訊. time ' + Date.now()
    }
    twilio.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('missing destination', function(done) {
    var payload = {
      to: '',
      text: '[operator] test from twilio. twilio 測試簡訊. time ' + Date.now()
    }
    twilio.send(payload, function(result) {
      expect(result.status).to.equal('failed');
      done();
    });
  });
})