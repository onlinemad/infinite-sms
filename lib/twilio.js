var request = require('request');
var debug = require('debug')('sms');

var twilio = function(config) {
  this.AccountSid = config.AccountSid;
  this.AuthToken = config.AuthToken;
  this.form = config.from;
}

twilio.prototype.send = function(payload, cb) {

  var data = {
    To: payload.to,
    From: this.from,
    Body: payload.text
  };

  debug('twilio request payload', data);

  request.post({
    url: 'https://api.twilio.com/2010-04-01/Accounts/' + this.AccountSid +  '/Messages.json',
    form: data,
    auth: {
      user: this.AccountSid,
      pass: this.AuthToken,
    }
  }, function(err, httpResponse, body){
    var obj = {
      provider: 'twilio'
    };

    if(!err) {
      debug('twilio response status', httpResponse.statusCode);
      debug('twilio response body', body);

      obj.raw = body;

      if(httpResponse.statusCode === 201) {
        obj.response = JSON.parse(body);

        if(obj.response.status === 'queued') {
          obj.status = 'ok';
        } else {
          obj.status = 'failed';
        }
      } else {
        obj.status = 'failed';
      }
    } else {
      obj.err = err;
      obj.status = 'failed';
    }
    
    debug('twilio callback return object', obj);

    return cb(obj);

  });
}

module.exports = twilio;