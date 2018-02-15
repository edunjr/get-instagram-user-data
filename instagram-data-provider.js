
const axios = require('axios');
const amqp = require("amqplib/callback_api");

var host = "amqp://localhost";
var queue = 'ig_data';
var username;
var user_data;
var replyto;
var uri;

amqp.connect('amqp://localhost', function(error, connection){
  connection.createChannel(function(error, channel){
    channel.assertQueue(queue, {durable: false});

    channel.consume(
      queue,
      function reply(message){
        username = message.content;

        getUserData(username).then(res => {
          user_data = JSON.parse(res);

          replyTo = message.properties.replyTo;

          channel.sendToQueue(
            replyTo,
            new Buffer(JSON.stringify(user_data)),
            { correlationId: message.properties.correlationId }
          );

          channel.ack(message);

        })
        .catch(function (e) {
          console.log(e);
        });
      }
    );
  });
});

function getUserData(username){
  uri = `https://www.instagram.com/${username}/?__a=1`;
  return axios.get(uri)
    .then(response =>  JSON.stringify(response.data.user))
    .catch(error => {
      console.log("request gone wrong: ", error);
    });
}
