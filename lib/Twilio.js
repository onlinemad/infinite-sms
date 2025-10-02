/**
 * Twilio SMS provider
 * https://www.twilio.com/en-us
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

const API_ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts'
const PROVIDER = 'twilio'

class Twilio {
  constructor(config) {
    this.AccountSid = config.AccountSid
    this.AuthToken = config.AuthToken
    this.from = config.from
    if (config.options) this.options = config.options
  }

  /**
   * Send SMS
   * 
   * API Docs.
   * https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource
   * 
   * @param {SmsPayload} payload 
   * @returns {SmsRes} response
   */
  async send(payload) {
    const body = Object.assign({
      To: payload.to,
      From: this.from,
      Body: payload.text
    }, this.options, payload.options)

    debug('twilio request body', body)

    try {
      const res = await axios.post(`${API_ENDPOINT}/${this.AccountSid}/Messages.json`, new URLSearchParams(body), {
        auth: {
          username: this.AccountSid,
          password: this.AuthToken,
        }
      })
      debug('twilio response body', res.data)

      const { data } = res
      /** @type {SmsRes} */
      const smsRes = {
        provider: PROVIDER,
        raw: data,
        rawJson: data
      }

      if (res.status === 201 && data.status === 'queued') {
        smsRes.id = data.sid
        return smsRes
      } else {
        throw new SmsError(PROVIDER, 'SEND_FAILED', `Send SMS by ${PROVIDER} failed`, smsRes?.rawJson || smsRes?.raw || smsRes)
      }
    } catch (err) {
      if (err instanceof SmsError) {
        throw err
      }
      throw new SmsError(PROVIDER, 'SEND_FAILED', err.response?.data?.message || err.message, err?.response?.data || err)
    }
  }

  /**
   * 查詢帳戶餘額
   * 
   * API Docs.
   * https://help.twilio.com/articles/360025294494-Check-Your-Twilio-Project-Balance
   * 
   * @returns {SmsBalance} balance
   */
  async balance() {
    try {
      const res = await axios.get(`${API_ENDPOINT}/${this.AccountSid}/Balance.json`, {
        auth: {
          username: this.AccountSid,
          password: this.AuthToken,
        }
      })
      debug('twilio response body', res.data)
      return {
        provider: PROVIDER,
        raw: res.data,
        rawJson: res.data,
        balance: res.data.balance
      }
    } catch (err) {
      throw new SmsError(PROVIDER, 'REQUEST_FAILED', err.response?.data?.message || err.message, err?.response?.data || err)
    }
  }


  /**
   * 處理主動狀態回報 Webhook 的 Payload
   * 
   * @param {object} payload 
   * @returns {import('../types/Types.js').SmsReceipt} receipt
   */
  static receipt(payload) {
    return {
      provider: PROVIDER,
      id: payload.SmsSid,
      status: payload.SmsStatus,
      raw: payload,
      rawJson: payload
    }
  }
}

export default Twilio
