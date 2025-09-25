/**
 * SMS-GET SMS provider
 * https://sms-get.com/index.php
 * 
 * API Docs.
 * https://sms-get.com/api_desc.php
 * 
 * @typedef {import('../types/Types.js').SmsBalance} SmsBalance
 * @typedef {import('../types/Types.js').SmsPayload} SmsPayload
 * @typedef {import('../types/Types.js').SmsReceipt} SmsReceipt
 * @typedef {import('../types/Types.js').SmsRes} SmsRes
 */

import { debuglog } from 'node:util'
import axios from 'axios'

import SmsError from './SmsError.js'

const API_ENDPOINT = 'https://sms-get.com'
const PROVIDER = 'smsget'

const debug = debuglog('sms')

class Smsget {
  constructor(cfg) {
    this.username = cfg.username
    this.password = cfg.password
    if (cfg.options) this.options = cfg.options
  }

  /**
   * Send SMS
   * 
   * @param {SmsPayload} payload 
   * @returns {SmsRes} response
   */
  async send(payload) {
    if (!payload.to.startsWith('+886')) {
      throw new SmsError(PROVIDER, 'UNSUPPORTED_COUNTRY', 'Phone number must start with +886 (Taiwan only)')
    }
    payload.to = payload.to.replace('+886', '0')

    const body = Object.assign({
      username: this.username,
      password: this.password,
      method: 1,
      phone: payload.to,
      sms_msg: payload.text
    }, this.options, payload.options)

    debug('smsget request body', body)

    const res = await axios.post(`${API_ENDPOINT}/api_send.php`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    debug('smsget response body', res.data)

    const { data } = res
    /** @type {SmsRes} */
    const smsRes = {
      provider: PROVIDER,
      raw: data,
      rawJson: data
    }

    if (data.stats === true && data.error_code === '000') {
      const errorMsgArray = data.error_msg.split('|')
      if (errorMsgArray.length > 0) {
        smsRes.id = errorMsgArray[0]
        smsRes.rawJson.id = errorMsgArray[0]
        smsRes.rawJson.used = errorMsgArray[1]
        smsRes.rawJson.remaining = errorMsgArray[2]
      }
      return smsRes
    } else {
      const message = smsRes?.rawJson?.error_msg || '發送錯誤'
      throw new SmsError(PROVIDER, 'SEND_FAILED', message, smsRes?.rawJson || smsRes.raw || smsRes)
    }
  }

  /**
   * 查詢帳戶餘額
   * 
   * @returns {SmsBalance} balance
   */
  async balance() {
    const res = await axios.post(`${API_ENDPOINT}/api_query_credit.php`, {
      username: this.username,
      password: this.password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    debug('smsget response body', res.data)
    const result = {
      provider: PROVIDER,
      raw: res.data,
      rawJson: res.data
    }
    if (res.data.stats === true && res.data.error_code === '000') {
      const msgArray = res.data.error_msg.split('|')
      if (msgArray.length > 0) {
        result.balance = msgArray[1]
      }
      return result
    } else {
      result.status = 'failed'
    }
  }

  /**
   * 處理主動狀態回報 Webhook 的 Payload
   * 
   * @param {object} payload 
   * @returns {SmsReceipt} receipt
   */
  static receipt(payload) {
    const receipt = {
      provider: PROVIDER,
      id: payload.sms_id,
      raw: payload,
      rawJson: payload
    }

    const columns = payload.content.split('|')
    receipt.rawJson.phone = columns[0]    // 電話號碼
    receipt.rawJson.id = columns[1]       // 簡訊辨識 ID
    receipt.rawJson.time = columns[2]     // 電信商回報時間
    receipt.status = columns[3]           // 回報狀態
    receipt.rawJson.status = columns[3]   // 回報狀態

    return receipt
  }
}

export default Smsget
