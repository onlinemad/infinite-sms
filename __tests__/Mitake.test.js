import { debuglog } from 'node:util'
import { strict as assert } from 'node:assert'
import { test, describe } from 'node:test'
import dayjs from 'dayjs'

import SmsError from '../lib/SmsError.js'

import Mitake from '../lib/Mitake.js'

import cfg from './config.js'

const PROVIDER = 'mitake'

const debug = debuglog('sms')

const mitake = new Mitake(cfg.mitake)

const msg = `呼叫小黃測試簡訊 Test message send by ${PROVIDER} ${dayjs().format('HH:mm:ss')}`

describe('Mitake SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(mitake)
    assert.equal(mitake.username, cfg.mitake.username)
    assert.equal(mitake.password, cfg.mitake.password)
  })

  test('should have send method', () => {
    assert.equal(typeof mitake.send, 'function')
  })

  test('should have balance method', () => {
    assert.equal(typeof mitake.balance, 'function')
  })
  
  // 真的發簡訊會扣點數，需要測試時再打開
  test.skip('should send text to phone number', async () => {
    const payload = {
      to: cfg.phoneNumber.tw,
      text: msg
    }
    
    const smsRes = await mitake.send(payload)
    debug('Mitake send result:', smsRes)

    // 基本結構檢查
    assert.equal(smsRes.provider, PROVIDER)
    
    // 檢查必要欄位存在且有意義的值
    assert.ok(smsRes.raw && typeof smsRes.raw === 'string', 'raw should be a non-empty string')
    assert.ok(smsRes.rawJson && typeof smsRes.rawJson === 'object', 'rawJson should be an object')
    assert.ok(smsRes.id && typeof smsRes.id === 'string', 'id should be a non-empty string')
    
    // 檢查具體業務邏輯
    assert.equal(smsRes.rawJson.msgid, smsRes.id)
    assert.equal(smsRes.rawJson.statuscode, '1')
    assert.ok(smsRes.rawJson.AccountPoint)
  })

   // 要聯絡三竹客服設定允許的 IP 才能測試
  test.skip('should throw error if IP is not allowed', async () => {
    const payload = {
      to: '+8861234',
      text: msg
    }
    
    try {
      await mitake.send(payload)
      assert.fail('Should throw error for IP restriction')
    } catch (err) {
      debug('caught error as expected:', err)
      
      // 檢查是否為 SmsError
      assert.ok(err instanceof SmsError, 'Should be SmsError instance')
      assert.equal(err.provider, PROVIDER)
      assert.equal(err.code, 'SEND_FAILED')
      
      // 檢查原始錯誤訊息
      assert.ok(err.raw, 'Should have raw error data')
      assert.equal(err.raw.statuscode, 'k')
      assert.ok(err.raw.Error, 'Should have error message')
      
      // 檢查中文錯誤訊息
      assert.ok(err.raw.Error.includes('無效的連線位址') || 
                err.raw.Error.includes('IP') || 
                err.raw.Error.includes('連線'), 
                'Should be IP or connection related error')
    }
  })

  test('should validate Taiwan phone numbers only', async () => {
    const payload = {
      to: '+1234567890', // non-Taiwan number
      text: msg
    }
    
    try {
      await mitake.send(payload)
      assert.fail('Should throw error for non-Taiwan number')
    } catch (err) {
      debug('caught error as expected:', err)
      assert.equal(err.provider, PROVIDER)
      assert.equal(err.code, 'UNSUPPORTED_COUNTRY')
      assert.equal(err.message, 'Phone number must start with +886 (Taiwan only)')
    }
  })

  test('should get balance from provider', async () => {
    const balance = await mitake.balance()
    debug('Mitake balance result:', balance)

    // 基本結構檢查
    assert.equal(balance.provider, PROVIDER)

    // 檢查必要欄位存在且有意義的值
    assert.ok(balance.raw && typeof balance.raw === 'string', 'raw should be a non-empty string')
    assert.ok(balance.balance && typeof balance.balance === 'string', 'balance should be a string')
    assert.ok(balance.rawJson && typeof balance.rawJson === 'object', 'rawJson should be an object')
    
    // 檢查具體業務邏輯
    assert.ok(balance.rawJson.AccountPoint, 'rawJson should have AccountPoint')
    assert.equal(balance.balance, balance.rawJson.AccountPoint, 'balance should match AccountPoint')
    
    // 檢查 balance 是數字格式的字串
    assert.ok(/^\d+$/.test(balance.balance), 'balance should be numeric string')
    assert.ok(parseInt(balance.balance) > 0, 'balance should be positive number')
  })

  test('receipt static method should parse webhook data', () => {
    const webhookData = {
      msgid: '$0005EF6C0',
      dstaddr: '0919919919',
      dlvtime: '20160923141411',
      donetime: '20160923141415',
      statusstr: 'DELIVRD',
      statuscode: '0',
      StatusFlag: '4'
    }
    
    const result = Mitake.receipt(webhookData)
    debug('Mitake receipt result:', result)

    assert.equal(result.provider, PROVIDER)
    assert.equal(result.id, '$0005EF6C0')
    assert.equal(result.status, 'DELIVRD')
    assert.deepEqual(result.rawJson, webhookData)
  })
})