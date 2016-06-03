import { capitalize, snakeCase } from 'lodash'

const addArtist = (bot,redis) => {
  return Promise.coroutine(function* (msg,match) {
    const { chat, from, text } = msg

    const artist_id = yield redis.hget('artists_slug_hash',snakeCase(match[1]))
    logger.info(`Adding ${match[1]} with id ${artist_id} for user id ${from.id}`)
    const res = yield redis.sadd(from.id,artist_id)
    logger.info(`Added ${res} items to set`)
    return bot.sendMessage(chat.id,`Registered your interest in ${match[1]}`)
  })
}

export default addArtist
