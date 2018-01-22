const redis = require('redis')
require('bluebird').promisifyAll(redis.RedisClient.prototype)

class Paste {

  /**
    * @constructor
    *
    * @param {String} title - the title/id of this Paste
    * @param {String} content - the content of this Paste
    * @param {String} user - the user who created this paste
    * @param {String[]} tags - a list of tags for this Paste
    *
    * @property {String} title
    * @property {String} content
    * @property {String} user
    * @property {String[]} tags
    *
    * @throws Error('Every Paste requires a title') - if key is not provided
    *
    */

  constructor(title, content='', user='', tags='') {
    if (!title){
      throw new Error('Every Paste requires a title')
    }
    this.title = `paste:${title}`
    this.content = content
    this.user = user
    this.tags = ''
  }

  /**
    * @static fields - the possible field values for a Paste
    */

  static get fields() {
    return  ['content', 'user', 'tags']
  }

  /**
  * @function new - create a new Paste
  *
  * @param {RedisClient} client - active Redis client
  * @param {boolean} overwrite - whether or not this Paste should be overwritten if it exists
  *
  * @returns {boolean} - true if the Paste was created
  *
  * @throws Error('Unauthorized overwrite') - user trying to overwrite is not same as creator
  * @throws Error(`Could not commit Paste`)
  *
  */

  async new(client, overwrite=false){
    const content = this.content
    const user = this.user
    const title = this.title
    const tags = this.tags

    let result;

    try {
      result = await client.hexistsAsync(title, 'content')
      if (result === 0 || overwrite){
        // TODO: if overwrite, check user
        result = await client.hmsetAsync(title, {content, user, tags, comments: '{}', upvotes: 0})
        return result === "OK";
      } else {
        return false;
      }
    } catch (e) {
      throw new Error(`Could not commit paste: ${e}`)
    }
  }

  /**
  * @function get - get this Paste's data
  *
  * @param {RedisClient} client - active Redis client
  * @param {String} title - the title of the Paste to get
  *
  * @returns {Paste} - the Paste from the Redis store
  *
  * @throws Error(`Could not get Paste`) - something went wrong with Redis
  *
  */

  async static get(client, title){
    let result;
    try {
      result = await client.hgetallAsync(title)
      return result;
    } catch (e) {
      throw new Error(`Could not get paste: ${e}`)
    }
  }

  /**
  * @function set - set the data on a Paste
  *
  * @param {RedisClient} client - active Redis client
  * @param {String} title - the title of the Paste to get
  * @param {Objects} fields - fields to set for the paste, properties are fields
  *
  * @returns {Paste} - the Paste from the Redis store
  *
  * @throws Error('Invalid field') - there was an invalid field in fields given
  * @throws Error(`Could not set fields`) - something went wrong with Redis
  *
  */
  async static set(client, title, fields){
    for (let field of Object.keys(fields)) {
      if (fields.hasOwnProperty(field) && !Paste.fields.includes(field)){
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
