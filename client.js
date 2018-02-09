const amqp = require("amqplib/callback_api");
const uuid = require("uuid/v4");

var host = "amqp://localhost";
var correlationId;
var username;

username = process.argv.slice(2);

amqp.connect(host, function(error, connection){
  connection.createChannel(function(error, channel){
    //experimentar dar um nome à queue (requer renomear o replyTo)
    channel.assertQueue('', {exclusive: true}, function(error, assertQueue){

      requestId = uuid();

      channel.sendToQueue('ig_data', new Buffer(username), {
        correlationId: requestId,
        replyTo: assertQueue.queue
      });

      channel.consume(assertQueue.queue, function(message){
        if(message.properties.correlationId == correlationId)
          console.log(/*response_object*/);
        connection.close();
        process.exit(0);
      });
    });
  });
});
