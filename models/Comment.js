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

  async addComment(client, user, position, content, givenId=undefined){
    const id = givenId || crypto.randomBytes(8).toString("hex");

    if (this.commentExists(client, id)){
      return this.editComment(client, id, {user, position, content})
    }

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
      let result = await this.iterateThroughSet(client, 0, `${id}:*`)

      if (result.length < 0){
        throw new Error(`No comment with ID: ${id}`)
      } else {
        result = result[0][0]     // result will be an array of array of strings from sscan
      }

      const removed = await client.sremAsync(this.title, result)
      const splitSet = result.split(':')

      if (splitSet.length < NUM_FIELDS){
        throw new Error('Invalid comment ${result}')
      }

      console.log('foo', splitSet);

      Object.entries(edits).map(entry => {
        const keyIndex = FIELDS.indexOf(entry[0])
        console.log(entry[0]);
        if (keyIndex !== -1){
          splitSet[keyIndex] = entry[1]
        }
      })

      console.log('bar', splitSet);

      splitSet[3] = Math.floor(new Date() / 1000).toString()

      console.log('baz', splitSet);
      const addResult = await client.saddAsync(this.title, splitSet.join(':'))
      return addResult === 1
    } catch (e) {
      throw new Error(`Could not edit comment: ${e}`)
    }
  }

  async iterateThroughSet(client, cursor, pattern){
    try {
      const returnSet = new Set();
      const reply = await client.sscanAsync(this.title, cursor, 'match', pattern);
      returnSet.add(reply[1]);
      return cursor === '0' ? Array.from(returnSet) : this.iterateThroughSet(client, reply[0], pattern)
    } catch (e) {
      throw new Error(`Could not commit comment: ${e}`)
    }
  }

  async getAllComments(client, includeDeleted=false){
    const pattern = includeDeleted ? "*" : "*:*:*:*:0:*"
    try {
      return this.iterateThroughSet(client, 0, pattern)
    } catch (e) {
      throw new Error(`Could not get comment list: ${e}`)
    }
  }

  async commentExists(client, id){
    try {
      return await this.iterateThroughSet(client, 0, `${id}:*`) !== 0
    } catch (e) {
        throw new Error(`Could not determine if ${id} exists`)
    }
  }

  async deleteComment(client, id){
    try {
      this.editComment(client, id, {deleted: 1})
    } catch (e){
      throw new Error(`Could not delete comment for id ${id}`)
    }
  }
}

module.exports = CommentSet
