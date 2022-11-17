const axios = require('axios')
const Promise = require('bluebird')
const debug = require('debug')('sms')

const mitake = function (config) {
  this.username = config.username
  this.password = config.password
  if (config.options) {
    this.options = config.options
  } else {
    this.options = {}
  }
  if (!this.options.api_url) {
    this.options.api_url = 'https://smsb2c.mitake.com.tw/b2c'
  }
}

mitake.prototype.send = function (payload) {

  if (payload.to.startsWith('+886')) {
    payload.to = payload.to.replace('+886', '0')

    let data = {
      username: this.username,
      password: this.password,
      dstaddr: payload.to,
      CharsetURL: 'UTF8',
      smbody: payload.text
    }

    data = Object.assign(data, this.options, payload.options)

    debug('mitake request payload', data)

    return axios.post(`${this.options.api_url}/mtk/SmSend`, null, {
      params: data
    }).then((res) => {
      debug('mitake response body', res.data)

      const obj = {
        provider: 'mitake',
        raw: res.data
      }

      const result_array = res.data.split('\r\n')
      const result = {}
      for (let i = 0; i < result_array.length; i++) {
        if (result_array[i] !== '[1]' && result_array[i] !== '') {
          const kv = result_array[i].split('=')
          result[kv[0]] = kv[1]
        }
      }
      obj.response = result

      if (['0', '1'].includes(result.statuscode)) {
        obj.status = 'ok'
        obj.id = result.msgid
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

mitake.prototype.balance = function (payload) {
  return axios.post(`${this.options.api_url}/mtk/SmQuery`, null, {
    params: {
      username: this.username,
      password: this.password
    }
  }).then((res) => {
    debug('mitake response body', res.data)
    const balance = parseInt(res.data.replace(/(?:\r\n|\r|\n)/g, '').split('=')[1])
    const obj = {
      provider: 'mitake',
      raw: res.data,
      status: 'ok',
      balance: balance
    }
    return Promise.resolve(obj)
  }).catch((err) => {
    return Promise.reject({
      err: err,
      status: 'failed'
    })
  })
}

mitake.receipt = function (payload) {
  const obj = {
    provider: 'mitake'
  }

  obj.id = payload.msgid
  obj.status = payload.statusstr
  obj.raw = payload

  return obj
}

module.exports = mitake