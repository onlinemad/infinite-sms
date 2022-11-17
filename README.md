# infinite-sms
SMS library for multi providers

# 無限 SMS

提供統一的 api 介面集合多個簡訊供應商

## 支援的供應商

* every8d
* kotsms (簡訊王)
* mitake (三竹)
* nexmo
* smsget
* twilio

## 統一的 request payload format

    let payload = {
      to: 'receiver phone number',
      text: 'message text',
      options: {
        callback: 'https://yourdimain/nexmo/callback'
      }
    }
    
## 統一的 callback response format

    let obj = {
      provider: 'provider',
      id: 'message id of provider',
      status: 'sending status response from provider',
      response: 'Parsed result as JSON object'
      raw: json object of raw callback response payload
    }

## 如何執行 Test case

將 `test/config.mocha.sample.json` 改為 `test/config.mocha.json`

編輯 `config.mocha.sample.json` 修改 `fixture.to` 改為你要測試的電話號碼（電話號碼格式為 [E.164 Numbers](https://www.twilio.com/docs/glossary/what-e164)）

編輯 `config.mocha.sample.json` 修改對應供應商的帳號密碼。

    DEBUG=sms mocha test/bootstrap.test.js test/lib/smsget.test.js

