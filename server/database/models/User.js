const Sequelize = require('sequelize')
const sequelize = require('../index')
const Model = Sequelize.Model
const Comment = require('./Comment')
const { Code, Record } = require('./Item')

class Subscript extends Model {}
Subscript.init({
  subscription: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  user: {
    type: Sequelize.STRING,
    primaryKey: true
  }
}, { sequelize })

class Subscription extends Model {}
Subscription.init({
  identifier: {
    type: Sequelize.STRING,
    primaryKey: true
  }
}, {
  hooks: {
    async afterCreate (instance, options) {
      const users = await User.findAll({
        attributes: ['email'],
        transaction: options.transaction
      })
      for (const user of users) {
        await Subscript.create({
          subscript: instance.identifier,
          user: user.email
        }, {
          transaction: options.transaction
        })
      }
    }
  },
  sequelize
})

class User extends Model {}
User.init({
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  latest: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  hooks: {
    async afterCreate (instance, options) {
      const subscriptions = await Subscription.findAll({
        attributes: ['identifier'],
        transaction: options.transaction
      })
      for (const subscription of subscriptions) {
        await Subscript.create({
          subscription: subscription.identifier,
          user: instance.email
        }, {
          transaction: options.transaction
        })
      }
    }
  },
  sequelize
})

Subscription.belongsToMany(User, { through: Subscript, foreignKey: 'subscription' })
User.belongsToMany(Subscription, { through: Subscript, foreignKey: 'user' })
User.hasMany(Code, { foreignKey: 'user' })
User.hasMany(Record, { foreignKey: 'user' })
User.hasMany(Comment, { foreignKey: 'user' })

module.exports = { User, Subscription, Subscript }
