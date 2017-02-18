var expect = require('chai').expect;

var Twilio = require('../../index').twilio;

var twilio = new Twilio(config.twilio);

describe.only('twilio', function() {
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
  it('optional parameter', function(done) {
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from nexmo 測試簡訊 テスト 😀 time ' + Date.now(),
      options: {
        StatusCallback: 'https://yourdimain/twilio/callback'
      }
    }
    twilio.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('receipt', function(done) {
    var payload = {
      SmsSid: 'SmsSid',
      SmsStatus: 'sent',
      MessageStatus: 'sent',
      To: '+123456789',
      MessageSid: 'SmsSid',
      AccountSid: 'AccountSid',
      From: '+123456789',
      ApiVersion: '2010-04-01'
    }
    var result = Twilio.receipt(payload);
    expect(result.id).to.equal('SmsSid');
    expect(result.provider).to.equal('twilio');
    expect(result.status).to.equal('sent');
    expect(result.raw).to.deep.equal(payload);
    done();
  });
})
