const { Record, Code } = require('../server/database/models/Item')
const router = require('./router')
const { getAllUsers } = require('./User')

async function addRecord (userEmail, problemId) {
  const [instance, created] = await Record.findOrBuild({
    where: {
      user: userEmail,
      item: problemId
    }
  })
  if (created) {
    instance.recordAt = new Date(Date.now())
  }
  await instance.save()
}

async function addNoteCode (userEmail, problemId, note, language, code) {
  const [instance] = await Code.findOrBuild({
    where: {
      user: userEmail,
      item: problemId
    }
  })
  instance.note = note
  instance.language = language
  instance.code = code
  instance.save()
}

router.post('/Record/record', async (req, res, next) => {
  try {
    const userEmail = req.user.email
    const problemId = req.body.id
    await addRecord(userEmail, problemId)
    const shareMore = req.body.shareMore
    if (shareMore) {
      const note = req.body.note
      const language = req.body.language
      const code = req.body.code
      await addNoteCode(userEmail, problemId, note, language, code)
    }
    res.status(200).send('打卡成功')
  } catch (e) {
    res.status(500).send('' + e)
  }
})

async function getRecordsByUser (userEmail) {
  const records = await Record.findAll({
    where: {
      user: userEmail
    },
    attributes: ['recordAt', 'item']
  })
  const analyticalData = analysis(records)
  analyticalData.user = userEmail
  analyticalData.shareCount = await Code.count({
    where: {
      user: userEmail
    }
  })
  analyticalData.languages = await Code.count({
    where: {
      user: userEmail
    },
    attributes: ['language'],
    group: 'language'
  })
  return analyticalData
}

router.post('/Record/getMyRecords', async (req, res, next) => {
  try {
    const records = await getRecordsByUser(req.user.email)
    res.status(200).json(records)
  } catch (e) {
    res.status(500).send('' + e)
  }
})

router.post('/Record/getRecordsByUser', async (req, res, next) => {
  try {
    const records = await getRecordsByUser(req.body.email)
    res.status(200).json(records)
  } catch (e) {
    res.status(500).send('' + e)
  }
})

function dateFormat (date, fmt = 'YYYY-mm-dd') {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}

function analysis (records) {
  // 统计数据
  const analyticalData = {
    count: 0,
    consist: 0,
    uniqueDay: 0,
    commits: [],
    problems: []
  }

  const tmp = []
  for (const x of records) {
    x.recordAt = new Date(x.recordAt)
    tmp.push(dateFormat(x.recordAt))
  }
  records.sort(function (a, b) {
    return b.recordAt - a.recordAt
  })
  let cursor
  const today = new Date()

  // 打卡次数（刷题总数）
  analyticalData.count = records.length

  // 累计天数
  if (records.length > 0) {
    let uniqueDay = 1
    let i = 1
    // 判断有多少个不同的日期，直接 toString 以后比较字符串相等即可
    while (i < records.length) {
      if (dateFormat(records[i].recordAt) !== dateFormat(records[i - 1].recordAt)) {
        uniqueDay++
      }
      i++
    }
    analyticalData.uniqueDay = uniqueDay

    // Contribution 图数据
    const commits = []
    // 所有提交对应的日期
    let first = true
    let day
    cursor = records[records.length - 1].recordAt
    while (cursor <= today) {
      const s = dateFormat(cursor)
      // day 是一周的第几天，针对当月来说
      // week 是第几周，针对所有数据来说，相当于图表的第几列
      if (first) {
        // 先强制 push 一个 0 次提交的，以避免所有天都有 commit 的情况下，热力图都是最浅颜色的问题
        cursor = new Date(cursor.setDate(cursor.getDate() - 1))
        day = cursor.getDay()
        commits.push({
          date: dateFormat(cursor),
          commits: 0,
          month: cursor.getMonth(),
          day: cursor.getDay(),
          week: Math.floor(day / 7)
        })
        day++
        cursor = new Date(cursor.setDate(cursor.getDate() + 1))
        first = false
      }
      commits.push({
        date: s,
        // 获取相同日期有多少个，就是当日打卡次数
        commits: tmp.filter(e => e === s).length,
        month: cursor.getMonth(),
        day: cursor.getDay(),
        week: Math.floor(day / 7)
      })
      // 加一天
      day++
      cursor = new Date(cursor.setDate(cursor.getDate() + 1))
    }
    analyticalData.commits = commits

    // 连续天数
    // 今天已打卡，从 1 开始记，今天未打卡，则从昨天开始记
    let consist = tmp.includes(dateFormat(today)) ? 1 : 0
    cursor = today
    cursor = new Date(cursor.setDate(cursor.getDate() - 1)) // 从前一天开始
    while (tmp.includes(dateFormat(cursor))) {
      consist++
      // 往前倒
      cursor = new Date(cursor.setDate(cursor.getDate() - 1))
    }
    analyticalData.consist = consist

    // 刷题列表
    const problems = []
    for (const x of records) {
      problems.push(x.item)
    }
    analyticalData.problems = problems
  }
  return analyticalData
}

async function getRankInfo () {
  const users = await getAllUsers()
  const rank = []
  for (const user of users) {
    // 注意必须 await
    rank.push(await getRecordsByUser(user.email))
  }
  return rank
}

router.post('/Record/getRankInfo', async (req, res, next) => {
  try {
    const rankInfo = await getRankInfo()
    res.status(200).json(rankInfo)
  } catch (e) {
    res.status(500).send('' + e)
  }
})
