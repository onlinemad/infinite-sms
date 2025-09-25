# infinite-sms
SMS library for multi providers

# 無限 SMS

提供統一的 api 介面集合多個簡訊供應商

## 支援的供應商

* Mitake (三竹)
* Nexmo
* SMS-GET
* Twilio

## v1.0.0 Breaking Changes

* callback response format 移除 status
* callback response format response rename to rawJson
* Smsget remove bidirectional functions

## 統一的 request payload format

    const payload = {
      to: 'receiver phone number',
      text: 'message text',
      options: {
        callback: 'https://yourdimain/nexmo/callback'
      }
    }
    
## 統一的 callback response format

    const smsRes = {
      provider: 'provider',
      id: 'message id of provider',
      raw: {} // raw response from provider,
      rawJson: {} // Parsed result as JSON object
    }

## 如何執行 Test case

將 `__tests__/config.example.js` 改為 `__tests__/config.js`

編輯 `config.js` 修改 `phoneNumber` 改為你要測試的電話號碼（電話號碼格式為 [E.164 Numbers](https://www.twilio.com/docs/glossary/what-e164)）

編輯 `config.mocha.sample.json` 修改對應供應商的帳號密碼。

    NODE_DEBUG=sms pnpm run test

