const Sequelize = require('sequelize')
const sequelize = require('../index')
const ItemTag = require('./ItemTag')
const Model = Sequelize.Model

class Item extends Model {
}

Item.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: Sequelize.STRING,
    allowNull: false
  },
  problem: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize
})

class Tag extends Model {
}

Tag.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize
})

class Code extends Model {
}

Code.init({
  language: {
    type: Sequelize.STRING,
    allowNull: false
  },
  note: {
    type: Sequelize.TEXT('long'),
    allowNull: true
  },
  code: {
    type: Sequelize.TEXT('long'),
    allowNull: true
  }
}, {
  sequelize
})

class Record extends Model {
}

Record.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recordAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, { sequelize })

Item.hasMany(Record, { foreignKey: 'item' })
Item.hasMany(Code, { foreignKey: 'item' })
Item.belongsToMany(Tag, { through: ItemTag, foreignKey: 'item' })
Tag.belongsToMany(Item, { through: ItemTag, foreignKey: 'tag' })

module.exports = {
  Item, Tag, Code, Record
}
