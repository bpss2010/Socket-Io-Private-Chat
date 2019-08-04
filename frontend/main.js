$(function(){

let enterEmail = prompt("Enter your email Id");
if(enterEmail!=null && enterEmail!=""){
    var socket = io.connect('http://localhost:3100/');
    var message        = $("#message");
    var username       = $("#username");
    var sendMessage    = $("#sendMessage");
    var sendUsername   = $("#sendUsername");
    var chatroom       = $("#chatroom");

    $("#showUserId").text(enterEmail);
    $("#userid").attr("data-userid",enterEmail);

    socket.emit("addNewUser",{userid:enterEmail});

    socket.on("listUser",function(dataListUser){
        $("#activeUserList").empty();
        //console.log(dataListUser);
        if(dataListUser.usersData.length>0){
          dataListUser.usersData.forEach((singleUser)=>{
            console.log(singleUser)
            if(singleUser.user_name!=enterEmail){
                $("#activeUserList").append("<li class='contact onlineuser' data-selecteduserid='"+singleUser.id+"' data-selecteduser='"+singleUser.user_name+"'><div class='wrap'><span class='contact-status online'></span><img src='http://www.gravatar.com/avatar/?d=identicon' alt='' /><div class='meta'><p class='name'>"+singleUser.user_name+"</p></div></div></li>")
            }
          })
        }
    })

    $("#activeUserList").on("click",'.onlineuser',function(){
        $(".onlineuser").removeClass("selected");
        let selectedUser = $(this).data("selecteduser");
        let selectedUserId = $(this).data("selecteduserid");
        console.log(selectedUser)
        console.log(selectedUserId)
        $("#selectedUser").text(selectedUser);
        $(this).addClass("selected");
        $(".chatBody").show();
        chatroom.empty();
        socket.emit("addUserToChat",{fromUser:enterEmail,toUser:selectedUserId});
    })
    socket.on("chatData",(chatsData)=>{
      console.log("All Chat Data",chatsData);

      let currentActiveChatUserId = $("#activeUserList li.selected").data('selecteduserid');
      console.log("currentActiveChatUserId",currentActiveChatUserId);
      if(!chatsData.isEmpty){
        if(chatsData.chatData.length>0){
          chatsData.chatData.forEach((singleChat)=>{

            console.log("Single Chat Data",singleChat);

            if(singleChat.toUser==parseInt(currentActiveChatUserId)){
              chatroom.append("<li class='replies'><img src='http://www.gravatar.com/avatar/?d=identicon' alt='' /><p>"+singleChat.message+"</p></li>");
            }else{
              chatroom.append("<li class='sent'><img src='http://www.gravatar.com/avatar/?d=identicon' alt='' /><p>"+singleChat.message+"</p></li>");
            }

          })
        }
      }
    })


    message.keypress(function(e){
      var code = (e.keyCode ? e.keyCode : e.which);
        //alert(code);
        if (code == 13) {
            sendMessage.trigger('click');
            return true;
        }
    })

    sendMessage.click(function(){
        let toUser = $("li.selected").data("selecteduser");
        let toUserId = $("li.selected").data("selecteduserid");
        let fromUser = $("#userid").attr("data-userid");
        socket.emit("newMessage",{message:message.val(),toUser:toUser,toUserId:toUserId,fromUser:fromUser});
        message.val(" ");
    });

    socket.on("newMessage",(data)=>{
      console.log("newMessage",data)
        chatroom.append("<li class='sent'><img src='http://www.gravatar.com/avatar/?d=identicon' alt='' /><p>"+data.message+"</p></li>");
    })
    socket.on("sentMessage",(data)=>{
      console.log("SentMsg",data)
        chatroom.append("<li class='replies'><img src='http://www.gravatar.com/avatar/?d=identicon' alt='' /><p>"+data.message+"</p></li>");
    })

    socket.on('connect', function(){});

}else{
    alert("Provide your email");
    location.reload(true)
}
})
