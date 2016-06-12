import { snakeCase, map, chunk, reduce } from 'lodash'
import { ADD_ARTIST } from '../constants/callbackTypes'

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
      const searchHash = reduce(artists,(acc,a) => { acc[a.id] = a.name; return acc },{})
      const opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: chunk(map(artists,(a) => { return { text: a.name, callback_data: JSON.stringify({ aid: a.id, type: ADD_ARTIST }) } }),1),
        })
      }
      yield redis.hmset('artists_hash',searchHash)
      return bot.sendMessage(chat.id, 'Select the artist you are interested in',opts)
    } catch(err) {
      logger.error(err)
      return bot.sendMessage(chat.id,'Error processing your search please try again')
    }
  })
}
export default searchArtists

