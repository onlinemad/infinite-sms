var expect = require('chai').expect;

var nexmo = require('../../index').nexmo;

var nexmo = new nexmo(config.nexmo);

describe('nexmo', function() {
  it.skip('success case', function(done) {
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
  it('receipt', function(done) {
    var payload = { 
      msisdn: '886918361763',
      to: '889989666777',
      'network-code': '46697',
      messageId: '06000000449DC552',
      price: '0.03580000',
      status: 'delivered',
      scts: '1609111016',
      'err-code': '0',
      'message-timestamp': '2016-09-11 10:17:39'
    }
    nexmo.receipt(payload, function(result) {
      expect(result.id).to.equal('06000000449DC552');
      expect(result.provider).to.equal('nexmo');
      expect(result.raw).to.deep.equal(payload);
      done();
    });
  });
})