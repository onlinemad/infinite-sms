const axios = require('axios')
const Promise = require('bluebird')
const querystring = require('querystring')
const debug = require('debug')('sms')

const smsget = function(config) {
  this.username = config.username
  this.password = config.password
  if (config.options) this.options = config.options
}

smsget.prototype.send = function(payload) {

  if (payload.to.startsWith('+886')) {
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

    return axios.post(`https://sms-get.com/api_send.php?${querystring.stringify(data)}`).then((res) => {
      debug('smsget response body', res.data)
      let obj = {
        provider: 'smsget'
      }
      obj.raw = res.data

      if (res.data.stats === true && res.data.error_code === '000') {
        obj.status = 'ok'
        let error_msg_array = res.data.error_msg.split('|')
        if(error_msg_array.length > 0) {
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

smsget.prototype.balance = function(payload) {
  let data = {
    username: this.username,
    password: this.password
  }

  debug('smsget request payload', data)

  return axios.post(`https://sms-get.com/api_query_credit.php?${querystring.stringify(data)}`).then((res) => {
    debug('smsget response body', res.data)
    let obj = {
      provider: 'smsget',
      raw: res.data
    }
    if (res.data.stats === true && res.data.error_code === '000') {
      obj.status = 'ok'
      let error_msg_array = res.data.error_msg.split('|')
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

smsget.receipt = function(payload) {
  var obj = {
    provider: 'smsget'
  }

  obj.id = payload.sms_id
  obj.status = payload.content.split('|')[3]
  obj.raw = payload

  return obj
}

module.exports = smsget
