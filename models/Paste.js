const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

class Paste {
  constructor(title, content='', user='') {
    if (!title){
      throw new Error('Every Paste requires a title')
    }
    this.title = `paste:${title}`
    this.content = content
    this.user = user
  }

  async commit(client){
    const p = await client.hexistsAsync(title, 'content')
    if (p === 0){
      return false
    } else {
      return (await client.hmsetAsync(title, {
        content,
        user,
        comments: [],
        upvotes: 0
      }) === 1)
    }
  }

  async get(client){
    return await client.hgetallAsync(`paste:${this.title}`)
  }
}



module.exports = { Paste }
