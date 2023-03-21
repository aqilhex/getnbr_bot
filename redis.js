const redisDB = require('redis');

var redis = redisDB.createClient({legacyMode: true,url:'redis://:8yJOBod0NpFwoe5954ZIU9Gz@esme.iran.liara.ir:31265/0'});

redis.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
  });
  redis.on('connect', function (err) {
    console.log('Connected to redis successfully');
  });
await redis.connect();
export default redis;
