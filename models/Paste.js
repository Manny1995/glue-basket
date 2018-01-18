const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

const FIELDS = ['content', 'user', 'tags']

class Paste {
  constructor(title, content='', user='', tags='') {
    if (!title){
      throw new Error('Every Paste requires a title')
    }
    this.title = `paste:${title}`
    this.content = content
    this.user = user
    this.tags = ''
  }

  async new(client, overwrite=false){
    const content = this.content
    const user = this.user
    const title = this.title
    const tags = this.tags

    let result;

    try {
      result = await client.hexistsAsync(title, 'content')
      if (result === 0 || overwrite){
        console.log(`Committing: ${title}: ${content}`)
        result = await client.hmsetAsync(title, {content, user, tags, comments: '{}', upvotes: 0})
        return result === "OK";
      } else {
        return false;
      }
    } catch (e) {
      throw new Error(`Could not commit paste: ${e}`)
    }
  }

  async get(client){
    const title = this.title;

    let result;
    try {
      result = await client.hgetallAsync(title)
      return result;
    } catch (e) {
      throw new Error(`Could not get paste: ${e}`)
    }
  }

  async set(client, fields){
    for (let field of Object.keys(fields)) {
      if (fields.hasOwnProperty(field) && !FIELDS.includes(field)){
        throw new Error(`Invalid field ${field}`)
      }
    }

    try {
      return await client.hmsetAsync(this.title, fields)
    } catch (e) {
      throw new Error(`Could not set fields: ${fields.keys()}: ${e}`)
    }
  }
}

module.exports = Paste
