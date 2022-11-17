const axios = require('axios')
const debug = require('debug')('sms')

const nexmo = function (config) {
  this.api_key = config.api_key
  this.api_secret = config.api_secret
  this.from = config.from
  if (config.options) this.options = config.options
}

nexmo.prototype.send = function (payload) {

  let data = {
    api_key: this.api_key,
    api_secret: this.api_secret,
    to: payload.to,
    from: this.from,
    text: payload.text,
    type: 'unicode'
  }

  data = Object.assign(data, this.options, payload.options)

  debug('nexmo request payload', data)

  return axios.post('https://rest.nexmo.com/sms/json', data).then((res) => {
    debug('nexmo response body', res.data)
    const obj = {
      provider: 'nexmo',
      raw: res.data
    }

    if (res.status === 200) {
      if (res.data.messages && res.data.messages.length === 1) {
        obj.id = res.data.messages[0]['message-id']
      }
      if (res.data.messages[0].status === '0') {
        obj.status = 'ok'
      } else {
        obj.status = 'failed'
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

nexmo.prototype.balance = function (payload) {
  return axios.get(`https://rest.nexmo.com/account/get-balance`, {
    params: {
      api_key: this.api_key,
      api_secret: this.api_secret
    }
  }).then((res) => {
    debug('nexmo response body', res.data)
    const obj = {
      provider: 'nexmo',
      raw: res.data,
      status: 'ok',
      balance: res.data.value
    }
    return Promise.resolve(obj)
  }).catch((err) => {
    return Promise.reject({
      err: err,
      status: 'failed'
    })
  })
}

nexmo.receipt = function (payload) {
  const obj = {
    provider: 'nexmo'
  }

  obj.id = payload.messageId
  obj.status = payload.status
  obj.raw = payload

  return obj
}

module.exports = nexmo
