const Sequelize = require('sequelize')
const { Item, Tag, Code, Record } = require('../server/database/models/Item')
const { getUserInfo } = require('./User')
const router = require('./router')

async function getItemList (data) {
  const itemList = []
  const result = await Item.findAll({
    include: [{
      model: Tag,
      attributes: ['name']
    },
    {
      model: Record,
      attributes: ['id']
    },
    {
      model: Code,
      attributes: ['id', 'note', 'code']
    }],
    attributes: ['id', 'platform', 'problem', 'title']
  })
  // 如果定义了关键字，那么在获取的列表中筛选所有符合关键字条件的返回
  // 否则返回所有结果
  for (let item of result) {
    item = item.toJSON()
    // Record 只返回长度，即打卡人数
    item.count = item.Records.length
    item.Records = undefined
    // Tag 只返回 name 数组
    item.tag = item.Tags.map(el => el.name)
    item.Tags = undefined
    // Code 不返回，只用作关键字判断
    const codes = item.Codes
    item.Codes = undefined
    if (data.keyword) {
      const keyword = data.keyword.toLowerCase()
      // 初始化布尔标记 hit 表示没找到，之后在一系列的“或”运算中更新 hit
      let hit = false
      hit = hit || item.platform.toLowerCase().includes(keyword)
      hit = hit || item.problem.toLowerCase().includes(keyword)
      hit = hit || item.title.toLowerCase().includes(keyword)
      for (const tag of item.tag) {
        hit = hit || tag.toLowerCase().includes(keyword)
        // 有一个命中了就不需要继续遍历了
        if (hit) {
          break
        }
      }
      // 如果已经命中了就不用再去 await 了，提高效率
      if (!hit) {
        for (const noteCode of codes) {
          hit = hit || (noteCode.note && noteCode.note.toLowerCase().includes(keyword))
          hit = hit || (noteCode.code && noteCode.code.toLowerCase().includes(keyword))
          // 有一个命中了就不需要继续遍历了
          if (hit) {
            break
          }
        }
      }
      if (hit) {
        itemList.push(item)
      }
    } else {
      itemList.push(item)
    }
  }
  return itemList
}

async function getItemInfo (id) {
  try {
    const result = await Item.findOne({
      where: {
        id
      },
      include: [{
        model: Tag,
        attributes: ['name']
      }]
    })
    const data = result.toJSON()
    data.tag = data.Tags.map(el => el.name)
    data.Tags = undefined
    return data
  } catch (e) {
    return null
  }
}

async function getNoteCodeInfo (userEmail, problemId) {
  try {
    const result = await Code.findOne({
      where: {
        user: userEmail,
        item: problemId
      }
    })
    return result.toJSON()
  } catch (e) {
    return null
  }
}

async function getAllNoteCodeInfo (problemId) {
  try {
    // 获取所有人的时候就要连头像一起了，只获取自己的时候可以不需要这一步
    const result = await Code.findAll({
      where: {
        item: problemId
      }
    })
    const data = []
    for (const x of result) {
      const user = await getUserInfo(x.user)
      data.push({
        id: x.id,
        note: x.note,
        language: x.language,
        code: x.code,
        updatedAt: x.updatedAt,
        avatar: user.avatar,
        email: user.email
      })
    }
    data.sort(function (a, b) {
      return b.updatedAt - a.updatedAt
    })
    return data
  } catch (e) {
    return null
  }
}

router.post('/Item/itemList', async (req, res, next) => {
  const itemList = await getItemList(req.body)
  res.json(itemList)
})

router.post('/Item/itemInfo', async (req, res, next) => {
  const item = await getItemInfo(req.body.id)
  if (item) {
    res.json(item)
  } else {
    res.sendStatus(404)
  }
})

router.post('/Item/noteCodeInfo', async (req, res, next) => {
  const userEmail = req.user.email
  const problemId = req.body.id
  const noteCode = await getNoteCodeInfo(userEmail, problemId)
  if (noteCode) {
    res.json(noteCode)
  } else {
    res.json({
      note: '',
      language: '',
      code: ''
    })
  }
})

router.post('/Item/allNoteCodeInfo', async (req, res, next) => {
  const problemId = req.body.id
  const allNoteCode = await getAllNoteCodeInfo(problemId)
  if (allNoteCode) {
    res.json(allNoteCode)
  } else {
    res.json([])
  }
})
