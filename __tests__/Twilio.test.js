import { debuglog } from 'node:util'
import { strict as assert } from 'node:assert'
import { test, describe } from 'node:test'
import dayjs from 'dayjs'

import SmsError from '../lib/SmsError.js'

import Twilio from '../lib/Twilio.js'

import cfg from './config.js'

const PROVIDER = 'twilio'

const debug = debuglog('sms')

const twilio = new Twilio(cfg.twilio)

const msg = `呼叫小黃測試簡訊 Test message send by ${PROVIDER} ${dayjs().format('HH:mm:ss')}`

describe('twilio SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(twilio)
    assert.equal(twilio.AccountSid, cfg.twilio.AccountSid)
    assert.equal(twilio.AuthToken, cfg.twilio.AuthToken)
    assert.equal(twilio.from, cfg.twilio.from)
  })

  test('should have send method', () => {
    assert.equal(typeof twilio.send, 'function')
  })

  test('should have balance method', () => {
    assert.equal(typeof twilio.balance, 'function')
  })

  // 真的發簡訊會扣點數，需要測試時再打開
  test.skip('should send text to phone number', async () => {
    const payload = {
      to: cfg.phoneNumber.us,
      text: msg
    }

    const smsRes = await twilio.send(payload)
    debug('Twilio send result:', smsRes)

    // 基本結構檢查
    assert.equal(smsRes.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(smsRes.raw && typeof smsRes.raw === 'object', 'raw should be a non-empty string')
    assert.ok(smsRes.rawJson && typeof smsRes.rawJson === 'object', 'rawJson should be an object')
    assert.ok(smsRes.id && typeof smsRes.id === 'string', 'id should be a non-empty string')

    // 檢查具體業務邏輯
    assert.equal(smsRes.rawJson.sid, smsRes.id)
  })

  test('should throw error if account is not allowed', async () => {
    const twilioWrong = new Twilio(cfg.twilioWrong)

    const payload = {
      to: cfg.phoneNumber.us,
      text: msg
    }

    try {
      await twilioWrong.send(payload)
      assert.fail('Should throw error for IP restriction')
    } catch (err) {
      debug('caught error as expected:', err)

      // 檢查是否為 SmsError
      assert.ok(err instanceof SmsError, 'Should be SmsError instance')
      assert.equal(err.provider, PROVIDER)
      assert.equal(err.code, 'SEND_FAILED')

      // 檢查原始錯誤資料結構
      assert.ok(err.raw, 'Should have raw error data')
      assert.equal(typeof err.raw, 'object', 'raw should be an object')

      // 檢查 Twilio 特定的錯誤格式
      assert.equal(err.raw.status, 401, 'status should be 401 for authentication error')
      assert.ok(err.raw.code, 'Should have Twilio error code')
      assert.ok(err.raw.message, 'Should have error message')
      assert.ok(err.raw.more_info, 'Should have more_info URL')

      // 檢查認證錯誤相關訊息
      assert.ok(err.raw.message.includes('Authentication Error') ||
        err.raw.message.includes('invalid username') ||
        err.raw.code === 20003,
        'Should be authentication related error')
    }
  })

  test('should get balance from provider', async () => {
    const balance = await twilio.balance()
    debug('Twilio balance result:', balance)

    // 基本結構檢查
    assert.equal(balance.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(balance.raw && typeof balance.raw === 'object', 'raw should be an object')
    assert.ok(balance.balance && typeof balance.balance === 'string', 'balance should be a string')
    assert.ok(balance.rawJson && typeof balance.rawJson === 'object', 'rawJson should be an object')

    // 檢查 balance 是數字格式的字串（支援小數點）
    assert.ok(/^\d+(\.\d+)?$/.test(balance.balance), 'balance should be numeric string with optional decimal')
    assert.ok(parseFloat(balance.balance) >= 0, 'balance should be non-negative number')
  })

  test('should throw error if account is not allowed when querying balance', async () => {
    const twilioWrong = new Twilio(cfg.twilioWrong)

    try {
      await twilioWrong.balance()
      assert.fail('Should throw error for IP restriction')
    } catch (err) {
      debug('caught error as expected:', err)

      // 檢查是否為 SmsError
      assert.ok(err instanceof SmsError, 'Should be SmsError instance')
      assert.equal(err.provider, 'twilio')
      assert.equal(err.code, 'REQUEST_FAILED')

      // 檢查原始錯誤資料結構
      assert.ok(err.raw, 'Should have raw error data')
      assert.equal(typeof err.raw, 'object', 'raw should be an object')

      // 檢查 Twilio 特定的錯誤格式
      assert.equal(err.raw.status, 401, 'status should be 401 for authentication error')
      assert.ok(err.raw.code, 'Should have Twilio error code')
      assert.ok(err.raw.message, 'Should have error message')
      assert.ok(err.raw.more_info, 'Should have more_info URL')

      // 檢查認證錯誤相關訊息
      assert.ok(err.raw.message.includes('Authentication Error') ||
        err.raw.message.includes('invalid username') ||
        err.raw.code === 20003,
        'Should be authentication related error')
    }

  })

  test('receipt static method should parse webhook data', () => {
    const webhookData = {
      SmsSid: 'SM1234567890abcdef',
      SmsStatus: 'delivered',
      MessageStatus: 'delivered',
      To: '+886912345678',
      MessageSid: 'SM1234567890abcdef',
      AccountSid: 'AC1234567890abcdef',
      From: '+1234567890',
      ApiVersion: '2010-04-01'
    }
    
    const result = Twilio.receipt(webhookData)
    
    assert.equal(result.provider, 'twilio')
    assert.equal(result.id, 'SM1234567890abcdef')
    assert.equal(result.status, 'delivered')
    assert.deepEqual(result.raw, webhookData)
  })

})