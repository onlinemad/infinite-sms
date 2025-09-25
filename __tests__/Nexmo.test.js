import { debuglog } from 'node:util'
import { strict as assert } from 'node:assert'
import { test, describe } from 'node:test'
import dayjs from 'dayjs'

import SmsError from '../lib/SmsError.js'

import Nexmo from '../lib/Nexmo.js'

import cfg from './config.js'

const PROVIDER = 'nexmo'

const debug = debuglog('sms')

const nexmo = new Nexmo(cfg.nexmo)

const msg = `呼叫小黃測試簡訊 Test message send by ${PROVIDER} ${dayjs().format('HH:mm:ss')}`

describe('nexmo (Vonage) SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(nexmo)
    assert.equal(nexmo.api_key, cfg.nexmo.api_key)
    assert.equal(nexmo.api_secret, cfg.nexmo.api_secret)
    assert.equal(nexmo.from, cfg.nexmo.from)
  })

  test('should have send method', () => {
    assert.equal(typeof nexmo.send, 'function')
  })

  test('should have balance method', () => {
    assert.equal(typeof nexmo.balance, 'function')
  })

  // 真的發簡訊會扣點數，需要測試時再打開
  test('should send text to phone number', async () => {
    const payload = {
      to: cfg.phoneNumber.tw,
      text: msg
    }
    
    const smsRes = await nexmo.send(payload)
    debug('Nexmo send result:', smsRes)

    // 基本結構檢查
    assert.equal(smsRes.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(smsRes.raw && typeof smsRes.raw === 'object', 'raw should be a non-empty string')
    assert.ok(smsRes.rawJson && typeof smsRes.rawJson === 'object', 'rawJson should be an object')
    assert.ok(smsRes.id && typeof smsRes.id === 'string', 'id should be a non-empty string')

    // 檢查具體業務邏輯
    assert.equal(smsRes.rawJson.messages[0]['message-id'], smsRes.id)
  })

  test('should throw error if account is not allowed', async () => {
    const nexmoWrong = new Nexmo(cfg.nexmoWrong)

    const payload = {
      to: cfg.phoneNumber.us,
      text: msg
    }

    try {
      await nexmoWrong.send(payload)
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

      // 檢查 Nexmo 特定的錯誤格式
      assert.equal(err.raw.status, '4', 'status should be 4 for authentication error')
      assert.ok(err.raw['error-text'], 'Should have error-text field')

      // 檢查認證錯誤相關訊息
      assert.ok(err.raw['error-text'].includes('Bad Credentials') ||
        err.raw.status === '4',
        'Should be authentication related error')
    }
  })

  test('should get balance from provider', async () => {
    const balance = await nexmo.balance()
    debug('Nexmo balance result:', balance)

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

  test('receipt static method should parse webhook data', () => {
    const webhookData = {
      messageId: 'msg_12345',
      status: 'delivered'
    }
    
    const result = Nexmo.receipt(webhookData)
    debug('Nexmo receipt result:', result)
    
    assert.equal(result.provider, 'nexmo')
    assert.equal(result.id, 'msg_12345')
    assert.equal(result.status, 'delivered')
    assert.deepEqual(result.raw, webhookData)
  })
})