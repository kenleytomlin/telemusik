import 'babel-polyfill'
import process from 'process'
import SpotifyWebApi from 'spotify-web-api-node'
import tg from 'node-telegram-bot-api'
import { createClient } from 'then-redis'
import Promise from 'bluebird'
import bunyan from 'bunyan'
global.logger = bunyan.createLogger({ name: 'telemusik' })
//Set the globale promise to bluebird promises
global.Promise = Promise
//Handlers
import searchArtists from './handlers/searchArtists'
import randomRecommendation from './handlers/randomRecommendation'
import start from './handlers/start'
//Callbacks
import callbacks from './callbacks/index'

//Helpers
import authorization from './helpers/spotify/authorization'

//Monkey patch telegram to receive callback queries
tg .prototype.__processUpdate = tg.prototype._processUpdate
tg.prototype._processUpdate = function _processUpdate(update) {
    const callbackQuery = update.callback_query;
    if (callbackQuery)
        this.emit('callback_query', callbackQuery);
    else
        this.__processUpdate(update)
}

const TELEGRAM_TOKEN = process.env['TELEGRAM_TOKEN']
const SPOTIFY_CLIENT_ID = process.env['SPOTIFY_CLIENT_ID']
const SPOTIFY_CLIENT_SECRET = process.env['SPOTIFY_CLIENT_SECRET']
const REDIS_HOST = process.env['REDIS_HOST']
const REDIS_PORT = process.env['REDIS_PORT']

const bot = new tg(TELEGRAM_TOKEN,{polling: true})
const spotify = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET
})
const redis = createClient({ host:REDIS_HOST,port: REDIS_PORT })

bot.on('callback_query',(msg) => {
  try {
    const data = JSON.parse(msg.data)
    logger.info(`Received callback with type ${data.type}`)
    callbacks[data.type]({ spotify, bot, redis })(msg,data)
  } catch (err) {
    logger.error('Error while processing callback',err)
  }
})

bot.onText(/\/start/,start(bot))
bot.onText(/\/search (.+)/,searchArtists(spotify,bot,redis))
bot.onText(/\/recommend/,randomRecommendation(spotify,bot,redis,authorization(spotify)))

