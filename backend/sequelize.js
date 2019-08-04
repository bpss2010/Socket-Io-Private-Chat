const Sequelize = require('sequelize')
const UsersModel = require('./models/users')
const ChatModel = require('./models/chats')

const sequelize = new Sequelize('chat', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const Users = UsersModel(sequelize, Sequelize)
const Chat = ChatModel(sequelize, Sequelize)

sequelize.sync({ force: false })
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  Users,
  Chat,
  sequelize

}
