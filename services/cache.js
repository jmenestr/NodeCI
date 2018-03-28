const redis = require('redis');
const { promisify } = require('util');
const mongoose = require('mongoose');
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const hdelAsync = promisify(client.hdel).bind(client);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
  const uniqueKey = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name,
  }))
  // See if we have a value for the 'key' in redis
  const cacheValue = await getAsync(uniqueKey);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc) ?
      doc.map(v => new this.model(v)) :
      new this.model(doc)
  }
  const result = await exec.apply(this, arguments);
  console.log(result)
  await setAsync(uniqueKey, JSON.stringify(result));
  return result;
}

// fetch('/api/blogs', {
//   method: 'POST',
//   credentials: 'same-origin',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     title: 'Title',
//     content: 'content',
//   })
// })
