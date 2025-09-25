/**
 * Nexmo SMS provider
 * https://www.vonage.com/communications-apis/
 * 
 * @typedef {import('../types/Types.js').SmsBalance} SmsBalance
 * @typedef {import('../types/Types.js').SmsPayload} SmsPayload
 * @typedef {import('../types/Types.js').SmsReceipt} SmsReceipt
 * @typedef {import('../types/Types.js').SmsRes} SmsRes
 */
import axios from 'axios'
import { debuglog } from 'node:util'

import SmsError from './SmsError.js'

const debug = debuglog('sms')

const API_ENDPOINT = 'https://rest.nexmo.com'
const PROVIDER = 'nexmo'

class Nexmo {
  constructor(config) {
    this.api_key = config.api_key
    this.api_secret = config.api_secret
    this.from = config.from
    if (config.options) this.options = config.options
  }

  /**
   * Send SMS
   * 
   * API Docs.
   * https://developer.vonage.com/en/api/sms
   * 
   * @param {SmsPayload} payload 
   * @returns {SmsRes} response
   */
  async send(payload) {
    const body = Object.assign({
      to: payload.to,
      from: this.from,
      text: payload.text,
      type: 'unicode'
    }, this.options, payload.options)

    debug('nexmo request body', body)

    try {
      const res = await axios.post(`${API_ENDPOINT}/sms/json`, body, {
        auth: {
          username: this.api_key,
          password: this.api_secret
        }
      })
      debug('nexmo response body', res.data)

      const { data } = res
      /** @type {SmsRes} */
      const smsRes = {
        provider: PROVIDER,
        raw: data,
        rawJson: data
      }

      if (res.status === 200 && data.messages && data.messages.length === 1) {
        smsRes.id = data.messages[0]['message-id']
        if (data.messages[0].status === '0') {
          return smsRes
        } else {
          throw new SmsError(PROVIDER, 'SEND_FAILED', smsRes?.rawJson?.messages[0]?.['error-text'] || `Send SMS by ${PROVIDER} failed`, smsRes?.rawJson?.messages[0] || smsRes.rawJson || smsRes)
        }
      } else {
        throw new SmsError(PROVIDER, 'SEND_FAILED', smsRes?.rawJson?.messages[0]?.['error-text'] || `Send SMS by ${PROVIDER} failed`, smsRes?.rawJson?.messages[0] || smsRes.rawJson || smsRes)
      }
    } catch (err) {
      if (err instanceof SmsError) {
        throw err
      }
      throw new SmsError(PROVIDER, 'SEND_FAILED', err.message, err.response?.data || err)
    }
  }

  /**
   * 查詢帳戶餘額
   * 
   * API Docs.
   * https://developer.vonage.com/en/api/account
   * 
   * @returns {SmsBalance} balance
   */
  async balance() {
    const res = await axios.get(`${API_ENDPOINT}/account/get-balance`, {
      auth: {
        username: this.api_key,
        password: this.api_secret
      }
    })
    debug('nexmo response body', res.data)
    return {
      provider: PROVIDER,
      raw: res.data,
      rawJson: res.data,
      balance: String(res.data.value)
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
      id: payload.messageId,
      raw: payload,
      rawJson: payload
    }
  }
}

export default Nexmo
