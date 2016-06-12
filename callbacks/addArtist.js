const addArtist = ({bot,redis}) => {
  return Promise.coroutine(function* (msg,data) {
    const artistName = yield redis.hget('artists_hash',data.aid)
    yield redis.sadd(msg.from.id,data.aid)
    logger.info(`Added ${data.aid} to set ${msg.from.id}`)
    return bot.sendMessage(msg.message.chat.id,`Registered your interest in ${artistName}`)
  })
}

export default addArtist
