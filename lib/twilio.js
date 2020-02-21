const axios = require('axios')
const debug = require('debug')('sms')

const twilio = function(config) {
  this.AccountSid = config.AccountSid
  this.AuthToken = config.AuthToken
  this.from = config.from
  if(config.options) this.options = config.options
}

twilio.prototype.send = function(payload) {

  let data = {
    To: payload.to,
    From: this.from,
    Body: payload.text
  }

  data = Object.assign(data, this.options, payload.options)

  debug('twilio request payload', data)

  return axios.post(`https://api.twilio.com/2010-04-01/Accounts/${this.AccountSid}/Messages.json`, new URLSearchParams(data), {
    auth: {
      username: this.AccountSid,
      password: this.AuthToken,
    }
  }).then((res) => {
    debug('twilio response body', res.data)
    let obj = {
      provider: 'twilio',
      raw: res.data
    }

    if (res.status === 201) {
      if (res.data.status === 'queued') {
        obj.status = 'ok'
        obj.id = res.data.sid
      } else {
        obj.status = 'failed'
      }
    } else {
      obj.status = 'failed'
    }
    return Promise.resolve(obj)
  }).catch((err) => {
    debug('twilio response error', err)
    if (err.response.data.status === 400) {
      return Promise.resolve({
        status:'failed',
        raw: err.response.data
      })
    } else {
      return Promise.reject({
        err: err,
        status: 'failed'
      })
    }
  })
}

twilio.prototype.balance = function(payload) {
  return axios.get(`https://api.twilio.com/2010-04-01/Accounts/${this.AccountSid}/Balance.json`, {
    auth: {
      username: this.AccountSid,
      password: this.AuthToken,
    }
  }).then((res) => {
    debug('twilio response body', res.data)
    let obj = {
      provider: 'twilio',
      raw: res.data,
      status: 'ok',
      balance: res.data.balance
    }
    return Promise.resolve(obj)
  }).catch((err) => {
    return Promise.reject({
      err: err,
      status: 'failed'
    })
  })
}

twilio.receipt = function(payload) {
  let obj = {
    provider: 'twilio'
  }

  obj.id = payload.SmsSid
  obj.status = payload.SmsStatus
  obj.raw = payload

  return obj
}

module.exports = twilio
