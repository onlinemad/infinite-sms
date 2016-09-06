var request = require('request');
var querystring = require('querystring');
var iconv = require('iconv-lite');
var debug = require('debug')('sms');

var kotsms = function(config) {
  this.username = config.username;
  this.password = config.password;
}

kotsms.prototype.send = function(payload, cb) {

  if(payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0');

    var data = {
      username: this.username,
      password: this.password,
      dstaddr: payload.to
    };

    debug('kotsms request payload', data);

    var smbody = iconv.encode(payload.text, 'big5').toString('binary');
    var url = 'https://api.kotsms.com.tw/kotsmsapi-1.php?' + querystring.stringify(data) + '&smbody=' + smbody

    debug('kotsms request url', url);

    request({
      url: url,
      encoding: null
    }, function(err,httpResponse,body){
      var obj = {
        provider: 'kotsms'
      };

      if(!err) {
        debug('kotsms response status', httpResponse.statusCode);
        debug('kotsms response body', body);

        obj.raw =  iconv.decode(body, 'utf8');

        var result_array = obj.raw.split('\n');
        var result = {};
        for (var i = 0; i < result_array.length; i++) {
          if(result_array[i] !== '[1]' && result_array[i] !== '') {
            var kv = result_array[i].split('=');
            result[kv[0]] = kv[1];
          }
        }
        obj.response = result;
      
        if(parseInt(obj.response.kmsgid) > 0) {
          obj.status = 'ok';
        } else {
          obj.status = 'failed';
        }

      } else {
        obj.err = err;
        obj.status = 'failed';
      }

      debug('kotsms callback return object', obj);

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

module.exports = kotsms;