import axios from 'axios'
import { debuglog } from 'node:util'

const debug = debuglog('sms')

// 沒有餘額了，無法開發
class Every8d {
  constructor(config) {
    this.UID = config.UID
    this.PWD = config.PWD
  }

  send(payload) {
    let data = {
      UID: this.UID,
      PWD: this.PWD,
      SB: Date.now(),
      DEST: payload.to,
      MSG: payload.text
    }

  debug('every8d request payload', data)

  return axios.get('https://oms.every8d.com/API21/HTTP/sendSMS.ashx', {
    params: data
  }).then((res) => {
    debug('every8d response body', res.data)

    let obj = {
      provider: 'every8d',
      raw: res.data
    }

    let result_array = obj.raw.split(',')

    if (parseInt(result_array[0]) > 0) {
      obj.status = 'ok'

      let result = {
        credit: result_array[0],
        sended: result_array[1],
        cost: result_array[2],
        unsend: result_array[3],
        batch: result_array[4]
      }
      obj.response = result
      obj.id = result.batch

    } else {
      obj.status = 'failed'
    }

    return Promise.resolve(obj)
  }).catch((err) => {
    return Promise.reject({
      err: err,
      status: 'failed'
    })
  })
  }
}

export default Every8d