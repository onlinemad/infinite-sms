/**
 * infinite-sms 型態定義
 * 
 * @file types/Type.js
 */

/**
 * SmsPayload 要求發送簡訊的 Payload
 * 
 * @typedef {object} SmsPayload
 * @property {string} to          - 目的地電話號碼，格式為 E.164，例如 +886912345678
 * @property {string} text        - 簡訊內容
 * @property {object} [options]   - 其他選項，依各服務提供者而異
 */

/**
 * SmsRes 簡訊供應商的回覆
 * 
 * @typedef {object} SmsRes
 * @property {string} provider     - 服務提供者名稱，例如 'twilio', 'nexmo'
 * @property {string} id           - 簡訊 ID，若傳送成功則存在
 * @property {object} raw          - 服務提供者回傳的原始資料
 * @property {object} rawJson      - 服務提供者回傳的詳細資料 JSON 格式，依各服務提供者而異
 */

/**
 * SmsBalance 簡訊帳戶的餘額
 * 
 * @typedef {object} SmsBalance
 * @property {string} provider     - 服務提供者名稱，例如 'twilio', 'nexmo'
 * @property {string} balance      - 帳戶餘額
 * @property {object} raw          - 服務提供者回傳的原始資料
 * @property {object} rawJson      - 服務提供者回傳的原始資料 JSON 格式，依各服務提供者而異
 */

/**
 * SmsError 錯誤物件
 *
 * @typedef {object} SmsError
 * @property {object} raw       - 原始錯誤物件
 * @property {string} provider  - 服務提供者名稱
 * @property {string} code      - 錯誤代碼
 * @property {string} message   - 錯誤訊息
 */

/**
 * SmsReceipt 簡訊送達回報
 * 
 * @typedef {object} SmsReceipt
 * @property {string} provider   - 服務提供者名稱，例如 'twilio', 'nexmo'
 * @property {string} id         - 簡訊 ID
 * @property {string} raw        - 服務提供者送達回報的原始資料
 * @property {string} rawJson    - 服務提供者送達回報的原始資料 JSON 格式，依各服務提供者而異
 */

export {}