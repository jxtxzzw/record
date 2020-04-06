const recordColumnsBase = [
  {
    title: '平台',
    key: 'platform',
    tree: true,
    sortable: 'custom'
  },
  {
    title: '题号',
    key: 'problem',
    sortable: 'custom'
  },
  {
    title: '题目',
    key: 'title',
    sortable: 'custom'
  },
  {
    title: '打卡人数',
    key: 'count',
    sortable: 'custom'
  }
]

function getRecordColumnsBase () {
  return Object.assign([], recordColumnsBase)
}

function customSort (info, recordData) {
  // 进行默认排序，恢复之前一种排序带来的结果
  recordData.sort((a, b) => {
    return a.id - b.id
  })
  // 除了升序、降序，注意有不排序的情况
  const reversed = info.order === 'asc' ? 1 : info.order === 'desc' ? -1 : 0
  if (reversed === 0) {
    // 不对任何关键字排序，则默认使用 id 主键
    recordData.sort((a, b) => {
      return a.id - b.id
    })
  } else
  // 开始对指定关键字排序，注意返回时乘上 reversed
  if (info.key === 'platform') {
    // 平台，进行字符串比较，获取 compare 值后乘上 reversed
    recordData.sort((a, b) => {
      return (a.platform < b.platform ? -1 : a.platform > b.platform ? 1 : 0) * reversed
    })
  } else if (info.key === 'problem') {
    // 最复杂的情况，比较题号
    recordData.sort((a, b) => {
      // 先尝试转换成数字，因为对于 LeetCode 绝大多数都是数字题号
      const numA = Number(a.problem)
      const numB = Number(b.problem)
      if (isNaN(numA) || isNaN(numB)) {
        if (isNaN(numA)) {
          if (isNaN(numB)) {
            // 都不是数字，按照原来的情况排序
            return (a.problem < b.problem ? -1 : a.problem > b.problem ? 1 : 0) * reversed
          } else {
            // A 不是数字，B 是数字，是数字的永远排在前面，与升序降序无关
            return 1
          }
        } else {
          // A 是数字，B 不是数字，是数字的永远排在前面，与升序降序无关
          return -1
        }
      } else {
        // 如果都是数字，那么直接按数字比大小
        return (numA - numB) * reversed
      }
    })
  } else if (info.key === 'title') {
    // 标题，进行字符串比较，获取 compare 值后乘上 reversed
    recordData.sort((a, b) => {
      return (a.title < b.title ? -1 : a.title > b.title ? 1 : 0) * reversed
    })
  } else if (info.key === 'count') {
    // 按打卡人数排序，这个一定是数字，就不需要特判了
    recordData.sort((a, b) => {
      return (parseInt(a.count) - parseInt(b.count)) * reversed
    })
  }
  return recordData
}

export { customSort, getRecordColumnsBase }
