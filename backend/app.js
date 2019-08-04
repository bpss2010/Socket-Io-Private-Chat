const express   = require('express');
const app       = express();
const cors      = require('cors');
const Sequelize = require('sequelize')
const { Users, Chat,sequelize } = require('./sequelize')
app.use(cors({credentials: true, origin: 'http://127.0.0.1'}));
var server = app.listen(3100,()=>{
    console.log("Connected...")
    console.log("Url:http://localhost:3100/")
})
var io = require('socket.io').listen(server);
var people={};

io.on('connection', function(socket) {
    console.log("A user Connected...");

        socket.on("addNewUser",(data,cb)=>{
            console.log(data.userid+'  is online');
            if (!data.userid in people){  //check if name is unique for //simplicity sake,we can use other means!
                return true;
            }else{
                people[data.userid] = socket.id;
                Users.create({"user_name":data.userid,"socket_id":socket.id,})
                .then((dataSet)=>{
                    updateListUser();
                })
                .catch((err)=>{
                    console.log(err)
                })

            }
        })

    function updateListUser(){

      Users.findAll({ raw: true }).then((usersData)=>{
        io.sockets.emit("listUser",{usersData})
      })
      .catch((err)=>{
        console.log(err)
      })

    }

    socket.on("addUserToChat",(selectedUser)=>{
      Users.findAll({ raw: true ,limit: 1,where: {user_name:selectedUser.fromUser}}).then((singleRowQuery)=>{
        Users.update({ connected_with: selectedUser.toUser },{ where: { id: singleRowQuery[0].id } })
        .then((modifiedRow)=>{

          let isEmpty = a => Array.isArray(a) && a.every(isEmpty);

          sequelize.query("SELECT * FROM `chats` WHERE (`fromUser` ='"+singleRowQuery[0].id+"' and `toUser` = '"+selectedUser.toUser+"') UNION SELECT * FROM `chats` WHERE (`toUser` = '"+singleRowQuery[0].id+"' and `fromUser` = '"+selectedUser.toUser+"') ORDER BY `id` ASC LIMIT 10", { type: Sequelize.QueryTypes.SELECT }).
          then(function(chatData){
            console.log(chatData)
            if(!isEmpty(chatData)){

            //  io.to(people[toUserRecord[0].user_name]).emit('chatData', {chatData:chatData,isEmpty:false});

              socket.emit("chatData",{chatData:chatData,isEmpty:false})

            }else{
              socket.emit("chatData",{chatData:chatData,isEmpty:true})
            }

          })

        })
        .catch((err)=>{
            console.log(err)
        })
      })
      .catch((err)=>{
        console.log(err)
      })
    })

    socket.on("newMessage",(sendedMessage)=>{

      Users.findAll({ raw: true ,limit: 1,where: {user_name:sendedMessage.fromUser}}).then((singleRowQuery)=>{

        Chat.create({"fromUser":singleRowQuery[0].id,"toUser":singleRowQuery[0].connected_with,"message":sendedMessage.message})
        .then((sendedMsgData)=>{

          Users.findAll({ raw: true ,limit: 1,where: {id:singleRowQuery[0].connected_with}}).
          then((toUserRecord)=>{
            console.log("toUserRecord",toUserRecord)

            socket.emit('sentMessage', {toUser:toUserRecord[0].user_name,message:sendedMessage.message,fromUser:sendedMessage.fromUser});


            if(toUserRecord[0].connected_with==singleRowQuery[0].id){
              console.log(toUserRecord[0].connected_with+"|"+singleRowQuery[0].id)
              io.to(people[toUserRecord[0].user_name]).emit('newMessage', {toUser:sendedMessage.toUser,message:sendedMessage.message,fromUser:sendedMessage.fromUser});
            }

          })
        })
        .catch((err)=>{
            console.log(err)
        })
      })
    })

    socket.on('disconnect', function (data) {
        var key = null;
        for (var k in people){
        if (people[k] ===socket.id){
            key = k;
            break;
        }
        }
        if (key != null)
        delete people[key];
        Users.destroy({where: {user_name: key}});
       console.log('A user disconnected');
       updateListUser();
    });


 });
