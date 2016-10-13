var request = require('request');
var querystring = require('querystring');
var iconv = require('iconv-lite');
var debug = require('debug')('sms');

var mitake = function(config) {
  this.username = config.username;
  this.password = config.password;
  if(config.options) this.options = config.options;
}

mitake.prototype.send = function(payload, cb) {

  if(payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0');

    var data = {
      username: this.username,
      password: this.password,
      dstaddr: payload.to,
      CharsetURL: 'UTF8',
      smbody: payload.text
    };

    data = Object.assign(data, this.options, payload.options);

    debug('mitake request payload', data);

    var url = 'http://smexpress.mitake.com.tw:7003/SpSendUtf?' + querystring.stringify(data);

    debug('mitake request url', url);

    request({
      url: url,
      encoding: null
    }, function(err, httpResponse, body){
      var obj = {
        provider: 'mitake'
      };

      if(!err) {
        debug('mitake response status', httpResponse.statusCode);
        debug('mitake response body', body);

        obj.raw = iconv.decode(body, 'big5');

        var result_array = obj.raw.split('\r\n');
        var result = {};
        for (var i = 0; i < result_array.length; i++) {
          if(result_array[i] !== '[1]' && result_array[i] !== '') {
            var kv = result_array[i].split('=');
            result[kv[0]] = kv[1];
          }
        }
        obj.response = result;

        if(obj.response.statuscode === '1') {
          obj.status = 'ok';
          obj.id = obj.response.msgid;
        } else {
          obj.status = 'failed';
        }
      } else {
        obj.err = err;
        obj.status = 'failed';
      }

      debug('mitake callback return object', obj);

      return cb(obj);

    });
  } else {
    var obj = {
      provider: 'mitake',
      status: 'failed',
      err: 'phone number is not starts with +886'
    };

    return cb(obj);
  }
}

mitake.receipt = function(payload) {
  var obj = {
    provider: 'mitake'
  };

  obj.id = payload.msgid;
  obj.status = payload.statusstr;
  obj.raw = payload;

  return obj;
}

module.exports = mitake;