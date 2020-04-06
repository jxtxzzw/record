const { Star } = require('../server/database/models/Item')
const router = require('./router')

async function getMyStarStatus (email) {
  const stars = await Star.findAll({
    where: {
      user: email
    },
    attributes: ['item']
  })
  return stars.map(el => el.item)
}

router.post('/Star/getMyStarStatus', async (req, res, next) => {
  const stars = await getMyStarStatus(req.user.email)
  res.json(stars)
})

async function changeStarStatus (email, id) {
  const [instance, created] = await Star.findOrCreate({
    where: {
      user: email,
      item: id
    }
  })
  // 如果没找到，说明本来没有，这次是星标，那 created 之后就好了
  // 如果找到了，即没有新建，那就是要取消星标了
  if (!created) {
    instance.destroy()
  }
}

router.post('/Star/changeStarStatus', async (req, res, next) => {
  try {
    await changeStarStatus(req.user.email, req.body.id)
    res.status(200).send()
  } catch (e) {
    res.status(500).send('' + e)
  }
})
