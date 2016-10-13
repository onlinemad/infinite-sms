var request = require('request');
var debug = require('debug')('sms');

var nexmo = function(config) {
  this.api_key = config.api_key;
  this.api_secret = config.api_secret;
  this.from = config.from;
  if(config.options) this.options = config.options;
}

nexmo.prototype.send = function(payload, cb) {

  var data = {
   api_key: this.api_key,
   api_secret: this.api_secret,
   to: payload.to,
   from: this.from,
   text: payload.text,
   type: 'unicode'
  };

  data = Object.assign(data, this.options, payload.options);

  debug('nexmo request payload', data);

  request.post({
    url: 'https://rest.nexmo.com/sms/json',
    headers: {
      'Content-Type': 'application/json'
    },
    form: data
  }, function(err, httpResponse, body){
    var obj = {
      provider: 'nexmo'
    };

    if(!err) {
      debug('nexmo response status', httpResponse.statusCode);
      debug('nexmo response body', body);

      obj.raw = body;

      if(httpResponse.statusCode === 200) {
        obj.response = JSON.parse(body);

        if(obj.response.messages && obj.response.messages.length === 1) {
          obj.id = obj.response.messages[0]['message-id'];
        }
        if(obj.response.messages[0].status === '0') {
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

    debug('nexmo callback return object', obj);

    return cb(obj);

  });
}

nexmo.receipt = function(payload) {
  var obj = {
    provider: 'nexmo'
  };

  obj.id = payload.messageId;
  obj.status = payload.status;
  obj.raw = payload;

  return obj;
}

module.exports = nexmo;
