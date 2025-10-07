import { debuglog } from 'node:util'
import { strict as assert } from 'node:assert'
import { test, describe } from 'node:test'
import dayjs from 'dayjs'

import SmsError from '../lib/SmsError.js'

import Smsget from '../lib/Smsget.js'

import cfg from './config.js'

const PROVIDER = 'smsget'
const PROVIDER_TWOWAY = 'smsgetTwoway'

const debug = debuglog('sms')

const smsget = new Smsget(cfg.smsget)
const smsgetTwoway = new Smsget(cfg.smsgetTwoway)

const msg = `呼叫小黃測試簡訊 Test message send by ${PROVIDER} ${dayjs().format('HH:mm:ss')}`

describe('smsget SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(smsget)
    assert.equal(smsget.username, cfg.smsget.username)
    assert.equal(smsget.password, cfg.smsget.password)
  })

  test('should have send method', () => {
    assert.equal(typeof smsget.send, 'function')
  })

  test('should have balance method', () => {
    assert.equal(typeof smsget.balance, 'function')
  })

  // 真的發簡訊會扣點數，需要測試時再打開
  test.skip('should send text to phone number', async () => {
    const payload = {
      to: cfg.phoneNumber.tw,
      text: msg
    }

    const smsRes = await smsget.send(payload)
    debug('Smsget send result:', smsRes)

    // 基本結構檢查
    assert.equal(smsRes.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(smsRes.raw && typeof smsRes.raw === 'object', 'raw should be a non-empty string')
    assert.ok(smsRes.rawJson && typeof smsRes.rawJson === 'object', 'rawJson should be an object')
    assert.ok(smsRes.id && typeof smsRes.id === 'string', 'id should be a non-empty string')

    // 檢查具體業務邏輯
    assert.equal(smsRes.rawJson.id, smsRes.id)
    assert.equal(smsRes.rawJson.used, '1')
    assert.ok(smsRes.rawJson.remaining)
  })

  // 使用 twoway 簡訊，真的發簡訊會扣點數，需要測試時再打開
  test.skip('should send text to phone number', async () => {
    const payload = {
      to: cfg.phoneNumber.tw,
      text: msg
    }

    const smsRes = await smsgetTwoway.send(payload)
    debug('Smsget send result:', smsRes)

    // 基本結構檢查
    assert.equal(smsRes.provider, PROVIDER_TWOWAY)

    // 檢查必要欄位存在且有意義的值
    assert.ok(smsRes.raw && typeof smsRes.raw === 'object', 'raw should be a non-empty string')
    assert.ok(smsRes.rawJson && typeof smsRes.rawJson === 'object', 'rawJson should be an object')
    assert.ok(smsRes.id && typeof smsRes.id === 'string', 'id should be a non-empty string')

    // 檢查具體業務邏輯
    assert.equal(smsRes.rawJson.id, smsRes.id)
    assert.equal(smsRes.rawJson.used, '2')
    assert.ok(smsRes.rawJson.remaining)
  })


  // 要到 SMS-GET 後台設定允許的 IP 才能測試
  test.skip('should throw error if IP is not allowed', async () => {
    const payload = {
      to: '+8861234',
      text: `呼叫小黃測試簡訊 Test message ${new Date()}`
    }

    try {
      await smsget.send(payload)
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

      // 檢查 smsget 特定的錯誤格式
      assert.equal(err.raw.stats, false, 'stats should be false for error')
      assert.ok(err.raw.error_code, 'Should have error_code')
      assert.ok(err.raw.error_msg, 'Should have error_msg')

      // 檢查 IP 相關錯誤訊息
      assert.ok(err.raw.error_msg.includes('IP無法存取') ||
        err.raw.error_msg.includes('IP') ||
        err.raw.error_code === '006',
        'Should be IP restriction related error')
    }
  })

  test('should validate Taiwan phone numbers only', async () => {
    const payload = {
      to: '+1234567890', // non-Taiwan number
      text: 'Test message'
    }

    try {
      await smsget.send(payload)
      assert.fail('Should throw error for non-Taiwan number')
    } catch (err) {
      debug('caught error as expected:', err)
      assert.equal(err.provider, PROVIDER)
      assert.equal(err.code, 'UNSUPPORTED_COUNTRY')
      assert.equal(err.message, 'Phone number must start with +886 (Taiwan only)')
    }
  })

  test('should get balance from provider', async () => {
    const balance = await smsget.balance()
    debug('Smsget balance result:', balance)

    // 基本結構檢查
    assert.equal(balance.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(balance.raw && typeof balance.raw === 'object', 'raw should be a non-empty string')
    assert.ok(balance.balance && typeof balance.balance === 'string', 'balance should be a string')
    assert.ok(balance.rawJson && typeof balance.rawJson === 'object', 'rawJson should be an object')

    // 檢查 balance 是數字格式的字串
    assert.ok(/^\d+$/.test(balance.balance), 'balance should be numeric string')
    assert.ok(parseInt(balance.balance) > 0, 'balance should be positive number')
  })

  test('receipt static method should parse webhook data', () => {
    const webhookData = {
      sms_id: '1783822',
      content: '0987566339|$0040B0FA7|2016-09-13 05:07:55|DELIVRD'
    }

    const result = Smsget.receipt(webhookData)
    debug('Smsget receipt result:', result)

    assert.equal(result.provider, PROVIDER)
    assert.equal(result.id, '1783822')
    assert.equal(result.status, 'DELIVRD')
    assert.deepEqual(result.raw, webhookData)
  })
})
