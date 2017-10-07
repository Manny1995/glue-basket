const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

const paste = require('./models/Paste')
const client = redis.createClient()

const p = new paste.Paste('HERPDERP', "BOOOOP")
if (p.commit(client)){
  console.dir(p.get(client, 'HERPDERP'))
} else {
  console.log('No paste')
}
