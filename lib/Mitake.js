/**
 * Mitake 三竹簡訊 SMS provider
 * https://sms.mitake.com.tw/common/index.jsp?t=1758651466494
 * 
 * API Docs.
 * https://sms.mitake.com.tw/common/header/download.jsp
 * 
 * @typedef {import('../types/Types.js').SmsBalance} SmsBalance
 * @typedef {import('../types/Types.js').SmsPayload} SmsPayload
 * @typedef {import('../types/Types.js').SmsReceipt} SmsReceipt
 * @typedef {import('../types/Types.js').SmsRes} SmsRes
 */

import { debuglog } from 'node:util'
import axios from 'axios'

import SmsError from './SmsError.js'

const debug = debuglog('sms')

const API_ENDPOINT = 'https://smsb2c.mitake.com.tw/b2c'
const PROVIDER = 'mitake'

const parseRes = (data) => {
  const resultArray = data.split(/\r?\n/).map(line => line.trim()).filter(line => line && line !== '[1]')
  const result = {}
  for (const line of resultArray) {
    const [key, value] = line.split('=')
    if (key && value !== undefined) {
      result[key] = value
    }
  }
  return result
}

class Mitake {
  constructor(cfg) {
    this.username = cfg.username
    this.password = cfg.password
    if (cfg.options) {
      this.options = cfg.options
    } else {
      this.options = {}
    }
  }

  /**
   * Send SMS
   * 
   * @param {SmsPayload} payload 
   * @returns {SmsRes} response
   */
  async send(payload) {
    if (!payload.to.startsWith('+886')) {
      throw new SmsError(PROVIDER, 'UNSUPPORTED_COUNTRY', 'Phone number must start with +886 (Taiwan only)', { error: { code: 'UNSUPPORTED_COUNTRY' } })
    }

    payload.to = payload.to.replace('+886', '0')

    const body = Object.assign({
      username: this.username,
      password: this.password,
      dstaddr: payload.to,
      smbody: payload.text
    }, this.options, payload.options)

    debug('mitake request body', body)

    const res = await axios.post(`${API_ENDPOINT}/mtk/SmSend`, body, {
      params: {
        CharsetURL: 'UTF8'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    debug('mitake response body', res.data)

    /** @type {SmsRes} */
    const smsRes = {
      provider: PROVIDER,
      raw: res.data
    }

    const result = parseRes(res.data)
    smsRes.rawJson = result

    if (['0', '1'].includes(result.statuscode)) {
      smsRes.id = result.msgid
      return smsRes
    } else {
      const message = smsRes?.rawJson?.Error || '發送錯誤'
      throw new SmsError(PROVIDER, 'SEND_FAILED', message, smsRes?.rawJson || smsRes?.raw || smsRes)
    }
  }

  /**
   * 查詢帳戶餘額
   * 
   * @returns {SmsBalance} balance
   */
  async balance() {
    const res = await axios.post(`${API_ENDPOINT}/mtk/SmQuery`, {
      username: this.username,
      password: this.password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    debug('mitake response body', res.data)
    const rs = parseRes(res.data)
    return {
      provider: PROVIDER,
      balance: rs.AccountPoint,
      raw: res.data,
      rawJson: rs
    }
  }

  /**
   * 處理主動狀態回報 Webhook 的 Payload
   * 
   * @param {object} payload 
   * @returns {SmsReceipt} receipt
   */
  static receipt(payload) {
    return {
      provider: PROVIDER,
      id: payload.msgid,
      status: payload.statusstr,
      raw: payload,
      rawJson: payload
    }
  }
}

export default Mitake