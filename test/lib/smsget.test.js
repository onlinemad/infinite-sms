var expect = require('chai').expect;

var Smsget = require('../../index').smsget;

var smsget = new Smsget(config.smsget);

describe('smsget', function() {
  it('success case', function(done) {
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
  it('optional parameter', function(done) {
    var today = new Date();
    var send_date = today.getFullYear() + '/' + ('00' + (today.getMonth() + 1).toString()).slice(-2) + '/' + today.getDate();
    var hour = ('00' + (today.getHours() + 1).toString()).slice(-2);
    var payload = {
      to: config.fixture.to,
      text: '[operator] test from nexmo. nexmo 測試簡訊. time ' + Date.now(),
      options: {
        method: '2',
        send_date: send_date,
        hour: hour,
        min: '00'
      }
    }
    smsget.send(payload, function(result) {
      expect(result.status).to.equal('ok');
      expect(result.id).to.exist;
      done();
    });
  });
  it('receipt', function(done) {
    var payload = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }
    var result = Smsget.receipt(payload);
    expect(result.id).to.equal('1783822');
    expect(result.provider).to.equal('smsget');
    expect(result.status).to.equal('DELIVRD');
    expect(result.raw).to.deep.equal(payload);
    done();
  });
})
