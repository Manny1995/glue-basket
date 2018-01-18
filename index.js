const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

const Paste = require('./models/Paste')
const Comment = require('./models/Comment')

const client = redis.createClient()

async function createPaste(){
  try {
    const p = new Paste('HERPDERP', "BOOOOP")
    console.log(await p.new(client))
    console.log(await p.get(client))
    await p.set(client, {'tags': 'new'})
    console.log(await p.get(client))
    createComment();
  } catch (e) {
    console.log(e)
  } finally {
    process.exit(5)
  }
}

async function createComment(){
  try {
    const c = new Comment('HERPDERP')
    console.log(await c.addComment(client, 'aelahi', 12, 'hurro'));
    console.log(await c.getAllComments(client));
  } catch (e) {
    console.log(e);
  }
}

createPaste();
