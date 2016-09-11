var request = require('request');
var querystring = require('querystring');
var debug = require('debug')('sms');

var every8d = function(config) {
  this.UID = config.UID;
  this.PWD = config.PWD;
}

every8d.prototype.send = function(payload, cb) {

  var data = {
    UID: this.UID,
    PWD: this.PWD,
    SB: Date.now(),
    DEST: payload.to,
    MSG: payload.text
  };

  debug('every8d request payload', data);

  var url = 'https://oms.every8d.com/API21/HTTP/sendsms.ashx?' + querystring.stringify(data);

  debug('every8d request url', url);

  request({
    url: url,
  }, function(err,httpResponse,body){    
    var obj = {
      provider: 'every8d'
    };

    if(!err) {
      debug('every8d response status', httpResponse.statusCode);
      debug('every8d response body', body);

      obj.raw = body;

      var result_array = obj.raw.split(',');

      if(parseInt(result_array[0]) > 0) {
        obj.status = 'ok';

        var result = {
          credit: result_array[0],
          sended: result_array[1],
          cost: result_array[2],
          unsend: result_array[3],
          batch: result_array[4]
        };
        obj.response = result;
        obj.id = result.batch;

      } else {
        obj.status = 'failed';
      }
    } else {
      obj.err = err;
      obj.status = 'failed';
    }

    debug('every8d callback return object', obj);

    return cb(obj);


  });
}

module.exports = every8d;