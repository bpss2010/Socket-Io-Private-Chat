module.exports = (sequelize, type) => {
    return sequelize.define('chats', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        fromUser:{
          type: type.INTEGER,
        },
        toUser:{
          type: type.INTEGER,
        },
        message:{
          type: type.STRING,
        }

    })
}
