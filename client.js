const amqp = require("amqplib/callback_api");
const uuid = require("uuid/v4");

var host = "amqp://localhost";
var correlationId = uuid();
var username;

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
            if(message.properties.correlationId == correlationId)
              console.log(message.content.toString());

            connection.close();
            process.exit(0);
          }
        );

      }
    );
  });
});
