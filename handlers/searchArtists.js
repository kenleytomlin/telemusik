import { snakeCase, map, chunk, reduce } from 'lodash'

const searchArtists = (spotify,bot,redis) => {
  return Promise.coroutine(function* (msg,match) {
    const { chat, from, text, message_id } = msg
    const [_,query] = match

    try {
      const searchResult = yield spotify.searchArtists(query)
      logger.info(JSON.stringify(searchResult.body))
      const artists = map(searchResult.body.artists.items,(i)=> {
        return {
          name: i.name,
          id: i.id,
          slug: snakeCase(i.name)
        }
      })

      if(artists.length === 0) {
        return bot.sendMessage(chat.id,`No artists found for ${match[1]}, refine your search and try again`)
      }

      const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
          keyboard: chunk(map(artists,(a) => { return `/add ${a.name}` }),1),
          resize_keyboard: true,
          force_reply: true,
          one_time_keyboard: true
        })
      }
      const searchHash = reduce(artists,(acc,a) => { acc[a.slug] = a.id; return acc },{})
      const res = yield redis.hmset('artists_slug_hash',searchHash)
      logger.info(searchHash)
      return bot.sendMessage(chat.id, 'Select the artist you are interested in',opts)
    } catch(err) {
      logger.error(err)
      return bot.sendMessage(chat.id,'Error processing your search please try again')
    }
  })
}
export default searchArtists

