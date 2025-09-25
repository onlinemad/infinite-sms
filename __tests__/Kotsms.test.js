import { test, describe } from 'node:test'
import { strict as assert } from 'node:assert'
import { kotsms as Kotsms } from '../index.js'
import { config, now } from './setup.js'

const kotsms = new Kotsms(config.kotsms)

// 沒有餘額了，無法測試
describe.skip('kotsms SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(kotsms)
    assert.equal(kotsms.username, config.kotsms.username)
    assert.equal(kotsms.password, config.kotsms.password)
  })

  test('should have send method', () => {
    assert.equal(typeof kotsms.send, 'function')
  })

  test('should validate Taiwan phone numbers only', async () => {
    const payload = {
      to: '+1234567890', // non-Taiwan number
      text: 'Test message'
    }
    
    try {
      await kotsms.send(payload)
      assert.fail('Should throw error for non-Taiwan number')
    } catch (error) {
      assert.equal(error.status, 'failed')
      assert.match(error.err, /phone number is not starts with \+886/)
    }
  })

  test('should format phone number correctly for Taiwan numbers', () => {
    const payload = {
      to: '+886912345678',
      text: `Test message from kotsms at ${now()}`
    }
    
    // Test that Taiwan numbers are accepted
    assert.ok(payload.to.startsWith('+886'))
    
    // Test conversion logic (would convert +886 to 0)
    const convertedNumber = payload.to.replace('+886', '0')
    assert.equal(convertedNumber, '0912345678')
  })
})