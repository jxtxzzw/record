const fs = require('fs')
const { User } = require('../server/database/models/User')
const { dispatch } = require('../assets/emailDispatcher')
const passwordEncrypt = require('../assets/passwordEncrypt')
const typeList = require('../assets/mimetype')
const uploadConfig = require('../assets/uploadConfig')
const router = require('./router')

async function getAllUsers () {
  const users = await User.findAll({
    attributes: [
      'email'
    ]
  })
  return users
}

router.post('/User/users', async (req, res, next) => {
  const users = await getAllUsers()
  res.json(users)
})

async function getUserInfo (email) {
  const user = await User.findOne({
    where: {
      email
    },
    attributes: [
      'email',
      'avatar',
      'latest'
    ]
  })
  return {
    email: user.email,
    avatar: user.avatar ? uploadConfig.upload + user.avatar : uploadConfig.defaultAvatar,
    latest: user.latest
  }
}

router.post('/User/userinfo', async (req, res, next) => {
  try {
    const result = await getUserInfo(req.body.email)
    res.status(200).json(result)
  } catch (e) {
    res.status(404).json(e)
  }
})

async function changePassword (user, password, res, rawPassword = undefined, action = 'password') {
  try {
    user.password = passwordEncrypt.serverEncrypt(password)
    await user.save()
    if (rawPassword) {
      dispatch(action, {
        email: user.email,
        password: rawPassword
      })
    }
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(500)
  }
}

function resetPassword (user, res, action = 'password') {
  const rawPassword = passwordEncrypt.randomPassword()
  changePassword(user, passwordEncrypt.clientEncrypt(rawPassword), res, rawPassword, action)
}

function register (user, res) {
  resetPassword(user, res, 'register')
}

router.post('/User/change', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.user.email,
        password: passwordEncrypt.serverEncrypt(req.body.oldPassword)
      }
    })
    if (user == null) {
      res.status(403).end('原密码错误')
    }
    changePassword(user, req.body.newPassword, res)
  } catch (e) {
    res.status(500).end('' + e)
  }
})

router.post('/User/register', async (req, res, next) => {
  try {
    // 需要是一个不持久化的 instance，之后通过修改密码处的 save() 来持久化
    // 如果直接用 .create() 就会因为密码 not null 而错误
    const [user, created] = await User.findOrBuild({
      where: {
        email: req.body.email
      }
    })
    if (created) {
      register(user, res)
    } else {
      resetPassword(user, res)
    }
  } catch (e) {
    res.status(500).end('' + e)
  }
})

router.post('/User/avatar', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.user.email
      }
    })
    const data = req.body
    let avatar
    if (data.fileList[0] && data.fileList[0].thumbUrl) {
      if (Object.prototype.hasOwnProperty.call(typeList, data.fileList[0].type)) {
        const imgData = data.fileList[0].thumbUrl
        const base64Data = imgData.replace(/(.*)?;base64,/, '')
        const dataBuffer = Buffer.from(base64Data, 'base64')
        avatar = new Date().getTime() + '.' + typeList[data.fileList[0].type]
        fs.writeFile(uploadConfig.uploadFS + avatar, dataBuffer, () => {
        })
      } else {
        throw new Error('图片类型不符合')
      }
      user.avatar = avatar
    } else {
      user.avatar = null
    }
    await user.save()
    res.sendStatus(200)
  } catch (e) {
    res.status(500).end('' + e)
  }
})

module.exports = { getAllUsers, getUserInfo }
