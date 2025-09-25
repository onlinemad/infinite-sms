import axios from 'axios'
import iconv from 'iconv-lite'
import { debuglog } from 'node:util'

const debug = debuglog('sms')

// 沒有餘額了，無法開發
class Kotsms {
  constructor(config) {
    this.username = config.username
    this.password = config.password
  }

  send(payload) {
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

    return axios.get(url, {
      responseType: 'arraybuffer'
    }).then((response) => {
      let obj = {
        provider: 'kotsms'
      }

      debug('kotsms response status', response.status)
      debug('kotsms response body', response.data)

      obj.raw = iconv.decode(response.data, 'utf8')

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

      debug('kotsms return object', obj)
      return Promise.resolve(obj)
    }).catch((err) => {
      return Promise.reject({
        provider: 'kotsms',
        err: err,
        status: 'failed'
      })
    })

  } else {
    return Promise.reject({
      provider: 'kotsms',
      status: 'failed',
      err: 'phone number is not starts with +886'
    })
  }
  }
}

export default Kotsms