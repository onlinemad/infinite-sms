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

    var payload = {
      to: 'receiver phone number',
      text: 'message text',
      options: {
        callback: 'https://yourdimain/nexmo/callback'
      }
    }
    
## 統一的 callback response format

    var obj = {
      provider: 'provider',
      id: 'message id of provider',
      status: 'sending status response from provider',
      raw: json object of raw callback response payload
    }
