let request = require('request')
let iconv = require('iconv-lite')
let debug = require('debug')('sms')

let kotsms = function (config) {
  this.username = config.username
  this.password = config.password
}

kotsms.prototype.send = function (payload, cb) {

  if (payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0')

    let data = {
      username: this.username,
      password: this.password,
      dstaddr: payload.to
    }

    debug('kotsms request payload', data)

    let smbody = iconv.encode(payload.text, 'big5').toString('binary')
    let qs = new URLSearchParams(data)
    let url = 'https://api.kotsms.com.tw/kotsmsapi-1.php?' + qs.toString() + '&smbody=' + smbody

    debug('kotsms request url', url)

    request({
      url: url,
      encoding: null
    }, function (err, httpResponse, body) {
      let obj = {
        provider: 'kotsms'
      }

      if (!err) {
        debug('kotsms response status', httpResponse.statusCode)
        debug('kotsms response body', body)

        obj.raw = iconv.decode(body, 'utf8')

        let result_array = obj.raw.split('\n')
        let result = {}
        for (let i = 0; i < result_array.length; i++) {
          if (result_array[i] !== '[1]' && result_array[i] !== '') {
            let kv = result_array[i].split('=')
            result[kv[0]] = kv[1]
          }
        }
        obj.response = result

        if (parseInt(obj.response.kmsgid) > 0) {
          obj.status = 'ok'
          obj.id = obj.response.kmsgid
        } else {
          obj.status = 'failed'
        }

      } else {
        obj.err = err
        obj.status = 'failed'
      }

      debug('kotsms callback return object', obj)

      return cb(obj)

    })

  } else {

    let obj = {
      provider: 'smsget',
      status: 'failed',
      err: 'phone number is not starts with +886'
    }

    return cb(obj)

  }
}

module.exports = kotsms;