const sequelize = require('../server/database/index')
const { Item } = require('../server/database/models/Item')
const Tag = require('../server/database/models/Item').Tag
const ItemTag = require('../server/database/models/ItemTag')
const router = require('./router')

async function CreateItem (data) {
  let transaction
  try {
    transaction = await sequelize.transaction({ autocommit: false })
    const [instance] = await Item.findOrCreate({
      where: {
        id: data.id || 0
      },
      defaults: {
        platform: data.platform,
        problem: data.problem,
        title: data.title
      }
    })
    await ItemTag.destroy({
      where: {
        item: instance.id
      },
      transaction
    })
    for (const tag of data.tags) {
      const [tagInstance] = await Tag.findOrCreate({
        where: {
          name: tag
        },
        defaults: {
          name: tag
        },
        transaction
      })
      await ItemTag.create({ item: instance.id, tag: tagInstance.id }, { transaction })
    }
    await transaction.commit()
    return instance
  } catch (e) {
    if (transaction) { await transaction.rollback() }
    throw new Error('失败:' + e)
  }
}

router.post('/update', async (req, res, next) => {
  try {
    const item = await CreateItem(req.body)
    await item.save()
    res.status(200).send('更新完成')
  } catch (e) {
    res.status(400).json(e.message)
  }
})
