const router = require('./router')

// 中间件的顺序是重要的，auth 必须放在第一个，否则后面的就无法访问 req.user
require('./auth')
require('./User')
require('./update')
require('./Item')
require('./record')
require('./Comment')

// Export the server middleware
export default {
  path: '/api',
  handler: router
}
