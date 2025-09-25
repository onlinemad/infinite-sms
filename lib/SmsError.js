/**
 *  @typedef {import('../types/Types.js').SmsError} SmsError
 */
class SmsError extends Error {
  /**
   * Creates a new SmsError instance
   *
   * @param {string} provider   - Sms provider
   * @param {string} code       - Error code
   * @param {string} message    - Error message
   * @param {object?} [raw={}]  - Raw error data
   */
  constructor(provider, code, message, raw = {}) {
    super(message)
    this.name = 'SmsError'
    this.provider = provider
    this.code = code
    this.raw = raw

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SmsError)
    }
  }
}

export default SmsError