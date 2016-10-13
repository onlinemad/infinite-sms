var request = require('request');
var querystring = require('querystring');
var debug = require('debug')('sms');

var smsget = function(config) {
  this.username = config.username;
  this.password = config.password;
  if(config.options) this.options = config.options;
}

smsget.prototype.send = function(payload, cb) {

  if(payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0');

    var data = {
      username: this.username,
      password: this.password,
      method: 1,
      phone: payload.to,
      sms_msg: payload.text
    };

    data = Object.assign(data, this.options, payload.options);

    debug('smsget request payload', data);

    var url = 'http://sms-get.com/api_send.php?' + querystring.stringify(data);

    debug('smsget request url', url);

    request({
      url: url,
    }, function(err,httpResponse,body){
      var obj = {
        provider: 'smsget'
      };

      if(!err) {
        debug('smsget response status', httpResponse.statusCode);
        debug('smsget response body', body);

        obj.raw = body;
        obj.response = JSON.parse(body);

        if(obj.response.stats === true && obj.response.error_code === '000') {
          obj.status = 'ok';
          var error_msg_array = obj.response.error_msg.split('|');
          if(error_msg_array.length > 0) {
            obj.id = error_msg_array[0];
          }
        } else {
          obj.status = 'failed';
        }
      } else {
        obj.err = err;
        obj.status = 'failed';
      }

      debug('smsget callback return object', obj);

      return cb(obj);

    });

  } else {
    var obj = {
      provider: 'smsget',
      status: 'failed',
      err: 'phone number is not starts with +886'
    };

    return cb(obj);
  }
}

smsget.receipt = function(payload) {
  var obj = {
    provider: 'smsget'
  };

  obj.id = payload.sms_id;
  obj.status = payload.content.split('|')[3];
  obj.raw = payload;

  return obj;
}

module.exports = smsget;
