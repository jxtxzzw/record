const { User } = require('../server/database/models/User')

async function getUserEmail (email = undefined) {
  let users
  const emails = []
  if (!email) {
    users = await User.findAll({
      attributes: [
        'email'
      ]
    })
  } else {
    users = await User.findAll({
      where: {
        email
      },
      attributes: [
        'email'
      ]
    })
  }
  for (const user of users) {
    emails.push(user.email)
  }
  return emails
}

module.exports = { getUserEmail }
