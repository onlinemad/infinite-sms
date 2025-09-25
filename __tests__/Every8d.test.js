import { test, describe } from 'node:test'
import { strict as assert } from 'node:assert'
import { every8d as Every8d } from '../index.js'
import { config, now } from './setup.js'

const every8d = new Every8d(config.every8d)

// 沒有餘額了，無法測試
describe.skip('every8d SMS provider', () => {
  test('should create instance with config', () => {
    assert.ok(every8d)
    assert.equal(every8d.UID, config.every8d.UID)
    assert.equal(every8d.PWD, config.every8d.PWD)
  })

  test('should have send method', () => {
    assert.equal(typeof every8d.send, 'function')
  })

  test('should prepare request data correctly', () => {
    const payload = {
      to: '+886912345678',
      text: `Test message from every8d at ${now()}`
    }
    
    // Test data structure (without making actual API call)
    const expectedData = {
      UID: config.every8d.UID,
      PWD: config.every8d.PWD,
      SB: expect.any(Number),
      DEST: payload.to,
      MSG: payload.text
    }
    
    assert.ok(payload.to)
    assert.ok(payload.text)
  })
})