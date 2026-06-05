/**
 * MitakeShort 三竹簡訊 SMS provider (短碼)
 * https://sms.mitake.com.tw/common/index.jsp?t=1758651466494
 * 
 * API Docs.
 * https://sms.mitake.com.tw/common/header/download.jsp
 */

import Mitake from './Mitake.js'

class MitakeShort extends Mitake {
  constructor(cfg) {
    super({ ...cfg, provider: 'mitakeShort' })
  }

  /**
   * 處理主動狀態回報 Webhook 的 Payload
   * 
   * @param {object} payload 
   * @returns {import('../types/Types.js').SmsReceipt} receipt
   */
  static receipt(payload) {
    return Mitake.receipt(payload, 'mitakeShort')
  }
}

export default MitakeShort
