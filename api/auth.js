const cookieParser = require('cookie-parser')
const jwt = require('express-jwt')
const jsonwebtoken = require('jsonwebtoken')
const uploadConfig = require('../assets/uploadConfig')
const passwordEncrypt = require('../assets/passwordEncrypt')
const { User } = require('../server/database/models/User')
const router = require('./router')

// Install middleware
router.use(cookieParser())

// JWT middleware
router.use(
  jwt({
    secret: process.env.RECORD_JWT_SECERT
  }).unless({
    path: [
      '/api/auth/login',
      '/api/User/register',
      '/api/Item/itemList'
    ]
  })
)

// -- Routes --

// [POST] /login
router.post('/auth/login', async (req, res, next) => {
  const { email, password } = req.body

  const user = await User.findOne({
    where: {
      email,
      password: passwordEncrypt.serverEncrypt(password)
    }
  })
  const valid = user != null

  if (!valid) {
    res.status(401).send('用户名或密码错误')
  } else {
    user.latest = new Date(Date.now())
    await user.save()

    const accessToken = jsonwebtoken.sign(
      {
        email,
        avatar: user.avatar ? uploadConfig.upload + user.avatar : uploadConfig.defaultAvatar
      },
      process.env.RECORD_JWT_SECERT,
      {
        expiresIn: '30d'
      }
    )

    res.json({
      token: {
        accessToken
      }
    })
  }
})

// [GET] /user
router.get('/auth/user', (req, res, next) => {
  res.json({ user: req.user })
})

// [POST] /logout
router.post('/auth/logout', (req, res, next) => {
  res.json({ status: 'OK' })
})

// Error handler
router.use((err, req, res, next) => {
  res.status(401).send(err + '')
})
