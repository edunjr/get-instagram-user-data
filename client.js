// Dependencies
const amqp = require("amqplib/callback_api");
const uuid = require("uuid/v4");

// Variables
var host = "amqp://localhost";
var correlationId = uuid();
var username;
var user;

username = process.argv.slice(2).toString();

amqp.connect(host, function(error, connection){
  connection.createChannel(function(error, channel){

    channel.assertQueue(
      'userinfo',
      {exclusive: true},
      function(error, assertQueue){

        channel.sendToQueue(
          'ig_data',
          new Buffer(username),
          { correlationId, replyTo: assertQueue.queue }
        );

        channel.consume(
          assertQueue.queue,
          (message) => {
            if(message.properties.correlationId == correlationId){
              user = JSON.parse(message.content.toString());

              console.log(user.full_name + ' (' + user.username + ')');
              console.log('Followers :', user.followed_by.count);
              console.log('Follows :', user.follows.count);
              console.log('Medias :', user.media.count);
              console.log('Profile Image URL :', user.profile_pic_url_hd);
            }
            connection.close();
            process.exit(0);
          }
        );

      }
    );
  });
});
