var request = require('request');
var querystring = require('querystring');
var iconv = require('iconv-lite');
var debug = require('debug')('sms');

var mitake = function(config) {
  this.username = config.username;
  this.password = config.password;
}

mitake.prototype.send = function(payload, cb) {

  var data = {
    username: this.username,
    password: this.password,
    dstaddr: payload.to,
    encoding: 'UTF8',
    smbody: payload.text
  };

  debug('mitake request payload', data);

  var url = 'http://smexpress.mitake.com.tw/SmSendGet.asp?' + querystring.stringify(data);

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
}

module.exports = mitake;