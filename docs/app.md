# 说明

所有都用 post

domain ：`ec2-18-188-112-81.us-east-2.compute.amazonaws.com:4001`

传参 url

```js
http://{domain}/app/{地址}?token={} // 需要鉴权带上token
```

传参格式

```js
{
  uuid: '' ,//
  content: {
    // 传递数据
  },
  sign: '' // 签名数据
}
```

返回格式

```js
{
  code: 0 // 0为成功 非0失败 -100 重新登录
  message : '',
  data : {}
}
```

加密 key

```js
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCTxS5zZcYCvciblqNcNmPIVKQaQcp3LJPAMQuF0D4B+vC6xg7l
Ua2YtN8eyVowq0z1PypQ7nAfUpWCwSpmS1cjaTcVviFIc8xRqQVu4vtfIxjX48QG
gK+3ir6q+08YLeu2wNqn2E5P62hmkgwVBIHTKA/wXxRozAUS0L9h53YpSQIDAQAB
AoGAL+i+JqvYhwsA/3DXhg4cS9clXV33RqwtOyKrmbbqY7n4UpXkPnU800XRESo3
E5B2Yw0XqyWjNISR9NKr7H6AwXsghkUVgMxWYXJp43pHMWRSji96yrMQGcGnmlLb
Mz5O0ru5UYXByETylx8B4shLcPuBQu1lcJCAECTX6pEuzAECQQDeFAjfbxptCa2j
5xe+8QTxkgUlErL/YLozlsxEdisUBnse7yDovVkvhCsj1JOZhZJmAYRYmk1P286P
lwiGYndjAkEAqld3mPa8RPBaqTkQiU85SJyTfdA9XL6kc6tjaFKvG2mndQ1Lks21
4byRlHhBS5XHnTXEI0q10rU17is/cDFqYwJAScUJ9X6onpPadFmtj6XsaHqC7v+5
Kg/tinmLPSqrwKkueOYiXm2XlKso0Wwp45N1QCE831nSWLbBdP1Mvacz1QJAeYt9
6CSuhBZo6nSwavmfq0MmLtDm6AWUPIDfprHRBqNl/Kym7zJfhJpT2nfQR4mxbGjP
8kq94IKy36X2Vyy7dwJBAKXJKABVdHfmk/gZ/SMk3y4PzoMunktbyxY6MbIjEGeQ
OZUBe+Rk2hypwpP1KfI/omEP8N7bv51ytNCsblwodyU=
-----END RSA PRIVATE KEY-----
```

# 钱包 APP 接口

## 用户模块

### 0. 发送验证码

`/common/verifyCode`

body 无

返回

```js
{
  code:0,
  message :''
}
```

ps: 还未申请短信接口，默认发送成功

### 1.注册

`/auth/register`

body

```js
{
  mobile : '', // 手机号
  password : '', // 密码
  verify_code: '', // 验证码
  invite_code: '' //邀请码
}
```

返回

```
{
  code: 0,
  message: ''
}
```

### 2.登录

`/auth/login`

body

```js
{
  mobile : '', // 手机号
  password : '', // 密码
}
```

返回

```
{
  code: 0,
  message: ''
}
```

### 3.忘记密码

`/auth/forgetPassword`

body

```js
{
  mobile : '', // 手机号
  password : '', // 密码
  verify_code: '' // 验证码
}
```

返回

```js
{
  code: 0,
  message: ''
}
```

### 4.用户信息

`/account/info?token={}`

body 无

返回

```js
{
  code: 0,
  message: '',
  data: {
    user: {
      mobile:'',
      wallet_address: '',
      user_info: {
        `sex` :'性别',
        `birth` : '',
        `realname` :'真实姓名',
        `idcard_no`:  '身份证号码',
        `idcard_positive`: '身份证正面',
        `idcard_reverse`: '身份证反面',
        `intro`: '个性签名？',
        `avatar`: '头像',
      }
    },
    invite_url: '', //邀请链接h5
  }
}
```

### 5.退出登录

`/account/logout?token={}`

body 无

返回

```js
{
  code: 0,
  message: ''
}
```

### 6.实名认证(更新用户信息)

`/account/infoUpdate?token={}`

body

```js
{
  realname : '', // 真实姓名
  sex: 1|2, // 性别
  idcard_no : '', // 身份整号码
  idcard_positive :'', // 身份证正面
  idcard_reverse : '' // 身份证反面
}
```

### 6.1 修改头像

`/account/infoUpdate?token={}`

body

```js
{
  avatar : '', // 头像
}
```

返回

```js
{
  code: 0,
  message: ''
}
```

### 7.更改密码

`/account/changePwd?token={}`

body

```js
{
  password : '', //
  password_again : '', //
}
```

返回

```js
{
  code: 0,
  message: ''
}
```

## 资产

### 用户资产

`/account/assets?token={}`

body 无

返回

```js
{
  code: 0,
  message: '',
  data : {
    balance: '', //
    token_balance: '' // 显示这个代币
  }
}
```

### 代币转账

`/account/assetsTransfer?token={}`

body

```js
{
  num: 100.5000, // 转账数量
  to_address: '0xD34f565DbA3a3afB197556E7901657E232b1B091', // 转账地址
  password: '123456' // 密码
}
```

返回

```js
{
  code: 0,
  message: '',
  data : {
  }
}
```

## 其他

### 上传文件

`/upload`

body 无

返回

```js
{
  code: 0,
  message: ''
  data: {
    url : url
  }
}
```

### 项目配置

`/common/config`

body 无

返回

```js
{
  code: 0,
  message: ''
  data: {
    version : '',
    news_url: '‘, //资讯h5页面
  }
}
```
