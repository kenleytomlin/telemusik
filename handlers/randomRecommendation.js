import { map } from 'lodash'

const randomRecommendation = (spotify,bot,redis) => {
  return Promise.coroutine(function* (msg) {
    const { chat, from } = msg

    const artistIds = yield redis.srandmember(from.id,5)
    logger.info(`Returned ${JSON.stringify(artistIds)} for ${from.id}`)
    const opts = {
      parse_mode: 'Markdown'
    }
    const res = yield spotify.getRecommendations({ min_energy: 0.4, seed_artists: artistIds, limit: 5, min_popularity: 50 })
    const md = map(res.body.tracks,(track) => {
      return `
      *${track.name}*
      By ${track.artists[0].name}
      [Preview Link](${track.preview_url})
      `
    }).join('\n')

    return yield bot.sendMessage(from.id,md,opts)
  })
}

export default randomRecommendation
