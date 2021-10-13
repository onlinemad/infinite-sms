const axios = require('axios')
const Promise = require('bluebird')
const debug = require('debug')('sms')

const every8d = function (config) {
  this.UID = config.UID
  this.PWD = config.PWD
}

every8d.prototype.send = function (payload) {

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

module.exports = every8d