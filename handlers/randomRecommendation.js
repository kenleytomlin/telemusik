import { map } from 'lodash'

const randomRecommendation = (spotify,bot,redis,auth) => {
  const rec = Promise.coroutine(function* (msg) {
    const { chat, from } = msg

    const artistIds = yield redis.srandmember(from.id,5)
    logger.info(`Returned ${JSON.stringify(artistIds)} for ${from.id}`)
    const opts = {
      parse_mode: 'Markdown'
    }
    try {
      yield auth()
      const res = yield spotify.getRecommendations({ min_energy: 0.4, seed_artists: artistIds.join(','), limit: 5, min_popularity: 50 })
      const md = map(res.body.tracks,(track) => {
        const message = `*${track.name}*\nBy ${track.artists[0].name}\n[Preview Link](${track.preview_url})`
        return bot.sendMessage(from.id,message,opts)
      })
      yield Promise.all(md)
    } catch (err) {
      if(err.statusCode === 401) {
        logger.info('Authorization required')
        yield auth()
        return rec(msg)
      } else {
        logger.error(err)
      }
    }
  })
  return rec
}

export default randomRecommendation
