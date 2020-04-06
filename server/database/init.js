// eslint-disable-next-line import/order
const dotenv = require('dotenv')
dotenv.config()

const passwordEncrypt = require('../../assets/passwordEncrypt')
const { User, Subscription } = require('./models/User')
const { Item } = require('./models/Item')
const { leetCodeProblems } = require('./defaultValues')
const sequelize = require('./index')

const MODELS = []
MODELS.push(User)
MODELS.push(require('./models/Item').Tag)
MODELS.push(Item)
MODELS.push(require('./models/ItemTag'))
MODELS.push(require('./models/Item').Code)
MODELS.push(require('./models/Item').Record)
MODELS.push(Subscription)
MODELS.push(require('./models/User').Subscript)
MODELS.push(require('./models/Comment'))

async function forceSyncModels (MODELS) {
  for (const model of MODELS) {
    await model.sync({ force: true })
  }
  // eslint-disable-next-line no-console
  console.log('Force Sync Done!')
}

async function generateDefaultValues () {
  for (const p of leetCodeProblems) {
    await Item.create({
      platform: p.platform,
      problem: p.problem,
      title: p.title
    })
  }

  await Subscription.create({ identifier: 'announcement' })
  await Subscription.create({ identifier: 'register' })
  await Subscription.create({ identifier: 'password' })

  let password = process.env.RECORD_ADMIN_PASSWORD
  // 如果没有定义 RECORD_ADMIN_PASSWORD 环境变量，或者该字符串长度为 0，则随机生成一个初始密码
  if (!password || password.length === 0) {
    password = passwordEncrypt.randomPassword()
  }
  await User.create({
    email: process.env.RECORD_ADMIN_EMAIL,
    password: passwordEncrypt.serverEncrypt(passwordEncrypt.clientEncrypt(password))
  })
  // eslint-disable-next-line no-console
  console.log(`${process.env.RECORD_ADMIN_EMAIL} 的密码是 ${password}。该密码仅会出现一次，请及时登录并修改。`)
}

sequelize
  .authenticate()
  .then(async () => {
    await forceSyncModels(MODELS)
    await generateDefaultValues()
  })
