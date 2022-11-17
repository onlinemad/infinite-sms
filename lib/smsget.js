const debug = require('debug')('sms')

const axios = require('axios')
const Promise = require('bluebird')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const smsget = function (config) {
  this.username = config.username
  this.password = config.password
  if (config.options) this.options = config.options
}

smsget.prototype._send = function (payload, bidirectional) {

  if (payload.to.startsWith('+886')) {
    let url = 'https://sms-get.com/api_send.php'
    if (bidirectional) {
      url = 'https://sms-get.com/api_send_twoway.php'
    }

    payload.to = payload.to.replace('+886', '0')

    let data = {
      username: this.username,
      password: this.password,
      method: 1,
      phone: payload.to,
      sms_msg: payload.text
    }

    data = Object.assign(data, this.options, payload.options)

    debug('smsget request payload', data)
    const qs = new URLSearchParams(data)
    return axios.post(`${url}?${qs.toString()}`).then((res) => {
      debug('smsget response body', res.data)
      const obj = {
        provider: 'smsget'
      }
      obj.raw = res.data
      obj.response = res.data

      if (res.data.stats === true && res.data.error_code === '000') {
        obj.status = 'ok'
        const error_msg_array = res.data.error_msg.split('|')
        if (error_msg_array.length > 0) {
          obj.id = error_msg_array[0]
        }
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
  } else {
    return Promise.reject({
      provider: 'smsget',
      status: 'failed',
      err: 'phone number is not starts with +886'
    })
  }
}
smsget.prototype.send = function (payload) {
  return this._send(payload, false)
}

smsget.prototype.balance = function () {
  const data = {
    username: this.username,
    password: this.password
  }
  debug('smsget request payload', data)
  const qs = new URLSearchParams(data)
  return axios.post(`https://sms-get.com/api_query_credit.php?${qs.toString()}`).then((res) => {
    debug('smsget response body', res.data)
    const obj = {
      provider: 'smsget',
      raw: res.data
    }
    if (res.data.stats === true && res.data.error_code === '000') {
      obj.status = 'ok'
      const error_msg_array = res.data.error_msg.split('|')
      if (error_msg_array.length > 0) {
        obj.balance = error_msg_array[1]
      }
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

smsget.prototype.bidirectional = function (payload) {
  return this._send(payload, true)
}

smsget.receipt = function (payload) {
  const obj = {
    provider: 'smsget'
  }

  obj.id = payload.sms_id
  obj.status = payload.content.split('|')[3]
  obj.raw = payload

  return obj
}

/**
 * Parse bidirectional sms webhook payload.
 * 
 * Payload sample
 * phone|id|timestamp|content
 * 0919123456|1634110261249|2021-10-13 15:30:01|24%E6%B8%AC%E8%A9%A61529
 * 
 * @param {object} payload 
 * @returns {{
 *  id: string,
 *  provider: string,
 *  phone: string,
 *  content: string,
 *  timestamp: number
 * }} bidirectional_receipt
 */
smsget.bidirectional_receipt = function (payload) {
  const obj = {
    provider: 'smsget'
  }
  debug(payload)
  const columns = payload.content.split('|')
  obj.id = columns[1]
  obj.phone = columns[0]
  obj.content = decodeURI(columns[3])
  obj.timestamp = dayjs.tz(columns[2], 'Asia/Taipei').valueOf()
  obj.raw = payload

  return obj
}

module.exports = smsget
