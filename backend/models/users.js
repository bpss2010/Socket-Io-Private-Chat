module.exports = (sequelize, type) => {
    return sequelize.define('users', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_name:{
          type:type.STRING,
        },
        socket_id:{
          type:type.STRING,
        },
        connected_with:{
          type: type.INTEGER,
        },
        last_seen:{
          type: type.DATE,
        },
        is_active:{
          type: type.INTEGER,
        }

    })
}
