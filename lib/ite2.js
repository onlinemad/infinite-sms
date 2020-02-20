const axios = require('axios')
const Promise = require('bluebird')
const querystring = require('querystring')
const debug = require('debug')('sms')

const ite2 = function(config) {
  this.UID = config.UID
  this.Pwd = Buffer.from(config.Pwd).toString('base64')
  if (config.options) this.options = config.options
}

ite2.prototype.send = function(payload) {

  if(payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0')

    let data = {
      UID: this.UID,
      Pwd: this.Pwd,
      DA: payload.to,
      SM: payload.text
    }

    data = Object.assign(data, this.options, payload.options)

    debug('ite2 request payload', data)

    return axios.post('https://smsc.ite2.com.tw:8090/ApiSMSC/Sms/SendSms', data).then((res) => {
      debug('ite2 response body', res.data)
      let obj = {
        provider: 'ite2',
        raw: res.data
      }

      if (res.data.ErrorCode === 0) {
        obj.status = 'ok',
        obj.id = new String(res.data.RowId)
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
      provider: 'ite2',
      status: 'failed',
      err: 'phone number is not starts with +886'
    })
  }
}

ite2.receipt = function(payload) {
  var obj = {
    provider: 'ite2'
  }

  obj.id = payload.sms_id
  obj.status = payload.content.split('|')[3]
  obj.raw = payload

  return obj
}

ite2.prototype.balance = function(payload) {
  let data = {
    UID: this.UID,
    Pwd: this.Pwd
  }

  return axios.post('https://smsc.ite2.com.tw:8090/ApiSMSC/Sms/QueryPoint', data).then((res) => {
    debug('ite2 response body', res.data)
    let obj = {
      provider: 'ite2',
      raw: res.data
    }
    if (res.data.ErrorCode === 0) {
      obj.status = 'ok',
      obj.balance = res.data.SmsPoint
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

module.exports = ite2
