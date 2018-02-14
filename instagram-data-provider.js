
const axios = require('axios');
const amqp = require("amqplib/callback_api");

var host = "amqp://localhost";
var queue = 'ig_data';
var username;
var user_data;
var replyto;

amqp.connect('amqp://localhost', function(error, connection){
  connection.createChannel(function(error, channel){
    channel.assertQueue(queue, {durable: false});

    channel.consume(
      queue,
      function reply(message){
        username = message.content;

        getUserData(username).then(res => {
          user_data = res;
          replyTo = message.properties.replyTo;

          channel.sendToQueue(
            replyTo,
            new Buffer(user_data),
            { correlationId: message.properties.correlationId }
          );

          channel.ack(message);

        });
      }
    );
  });
});

function getUserData(username){
  var uri = `https://www.instagram.com/${username}/?__a=1`;
  return axios.get(uri)
    .then(response =>  response.data.user.biography)
    .catch(error => {
      console.log("request gone wrong: ", error);
    });
}
