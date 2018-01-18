const crypto = require("crypto")
const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

const NUM_FIELDS = 6;
const FIELDS = ['id', 'user', 'position', 'dateModified', 'deleted', 'content']
// const COMMENT_FORMAT = `${id}:${user}:${position}:${date}:${deleted}:${content}`

class CommentSet {
  constructor(key) {
    if (!key){
      throw new Error('Every CommentSet requires a key')
    }
    this.title = `comment:${key}`
  }

  async addComment(client, user, position, content){
    const id = crypto.randomBytes(8).toString("hex");
    const dateModified = Math.floor(new Date() / 1000).toString()

    const comment = `${id}:${user}:${position}:${dateModified}:0:${content}`

    let result;

    try {
      console.log(`Committing new comment: ${id} at ${position} from ${user}`)
      result = await client.saddAsync(this.title, comment)
      return result === 1;
    } catch (e) {
      throw new Error(`Could not commit comment: ${e}`)
    }
  }

  async editComment(client, id, edits){
    try {
      const result = await iterateThroughSet(client, 0, `^${id}:`)[0]
      const removed = await client.sremAsync(this.title, result)
      const splitSet = result.split(':')

      if (splitSet.length < NUM_FIELDS){
        throw new Error('Invalid comment ${result}')
      }

      Object.entries(edits).map((key, value) => {
        const keyIndex = FIELDS.indexOf(key)
        if (keyIndex !== -1){
          splitSet[keyIndex] = value
        }
      })

      splitSet[3] = Math.floor(new Date() / 1000).toString()

      const addResult = await client.saddAsync(this.title, splitSet)
      return addResult === 1
    } catch (e) {
      throw new Error(`Could not edit comment: ${e}`)
    }
  }

  async iterateThroughSet(client, cursor, pattern){
    try {
      const returnSet = new Set();
      const reply = await client.sscanAsync(this.title, cursor, 'match', pattern);
      returnSet.add(reply[1])
      return cursor === '0' ? Array.from(returnSet) : iterateThroughSet(client, reply[0], pattern)
    } catch (e) {
      throw new Error(`Could not commit comment: ${e}`)
    }

  }

  async getAllComments(client){
    try {
      console.log('GETTING ALL COMMENTS');
      return await client.smembersAsync(`comment:${this.title}`);
    } catch (e) {
      throw new Error(`Could not get comment list: ${e}`)
    }
  }

}

module.exports = CommentSet
