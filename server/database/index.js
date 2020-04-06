const Sequelize = require('sequelize')

let sequelize

if (process.env.RECORD_DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize(
    {
      dialect: process.env.RECORD_DB_DIALECT,
      storage: process.env.RECORD_DB
    }
  )
} else {
  sequelize = new Sequelize(
    process.env.RECORD_DB,
    process.env.RECORD_USERNAME,
    process.env.RECORD_PASSWORD,
    {
      dialect: process.env.RECORD_DB_DIALECT
    }
  )
}

module.exports = sequelize
