import { test, describe } from 'node:test'
import { strict as assert } from 'node:assert'
import { ite2 as Ite2 } from '../index.js'
import { config, now } from './setup.js'

const ite2 = new Ite2(config.ite2)

// 沒有餘額了，無法測試
describe.skip('ite2 SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(ite2)
    assert.equal(ite2.UID, config.ite2.UID)
    assert.equal(ite2.Pwd, Buffer.from(config.ite2.PWD).toString('base64'))
  })

  test('should have send method', () => {
    assert.equal(typeof ite2.send, 'function')
  })

  test('should have balance method', () => {
    assert.equal(typeof ite2.balance, 'function')
  })

  test('should validate Taiwan phone numbers only', async () => {
    const payload = {
      to: '+1234567890', // non-Taiwan number
      text: 'Test message'
    }
    
    try {
      await ite2.send(payload)
      assert.fail('Should throw error for non-Taiwan number')
    } catch (error) {
      assert.equal(error.status, 'failed')
      assert.match(error.err, /phone number is not starts with \+886/)
    }
  })

  test('receipt static method should parse webhook data', () => {
    const webhookData = {
      sms_id: '12345',
      content: 'status|info|data|DELIVERED'
    }
    
    const result = Ite2.receipt(webhookData)
    
    assert.equal(result.provider, 'ite2')
    assert.equal(result.id, '12345')
    assert.equal(result.status, 'DELIVERED')
    assert.deepEqual(result.raw, webhookData)
  })
})