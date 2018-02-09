
const axios = require('axios');
const amqp = require("amqplib/callback_api");

var host = "amqp://localhost";
var queue = 'ig_data';
var username;
var user_data;
var replyto;

amqp.connect(host, function(error, connection){
  connection.createChannel(function(error, channel){
    channel.assertQueue(queue, {durable: false});

    console.log("2");
    channel.consume(queue, function reply(message){
      console.log("message content", message.content);
      username = message.content;
      console.log("3");
      user_data = getUserData(username);
      replyTo = message.properties.replyTo;

      channel.sendToQueue(replyTo, new Buffer(user_data), {
        correlationId: message.properties.correlationId
      });
      channel.ack(message);
    });
  });
});


function getUserData(){
  console.log("4");
  axios.get('https://www.instagram.com/netoabel/?__a=1')
    .then(response => {
console.log("5");
      return(response.data.user.username);
    })
    .catch(error => {
      console.log("getUserData error: ", error);
    });
}
