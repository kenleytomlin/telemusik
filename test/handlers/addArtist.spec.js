import addArtist from '../../handlers/addArtist'

describe('handlers/addArtist', () => {
  function setup() {
    const msg = {
      text: '/add Artist Name',
      message_id: 12345,
      chat: {
        id: 12345
      },
      from: {
        id: 98765
      }
    }
    const match = [
      '/add',
      'Artist Name'
    ]
    const fakeRedis = {
      hget: expect.createSpy().andReturn(Promise.resolve('12345')),
      sadd: expect.createSpy().andReturn(Promise.resolve(1))
    }

    const fakeBot = {
      sendMessage: expect.createSpy().andReturn(Promise.resolve())
    }

    return {
      msg,
      match,
      fakeRedis,
      fakeBot
    }
  }

  it('returns a function', () => {
    const { fakeBot, fakeRedis } = setup()
    const handler = addArtist(fakeBot,fakeRedis)

    expect(handler).toBeA(Function)
  })

  it('calls redis.hget with the correct arguments', () => {
    const { fakeBot, fakeRedis,match,  msg } = setup()
    const handler = addArtist(fakeBot,fakeRedis)

    return handler(msg,match).then(() => {
      expect(fakeRedis.hget).toHaveBeenCalledWith('artists_slug_hash','artist_name')
    })
  })

  it('calls redis.sadd with the correct arguments', () => {
    const { fakeBot, fakeRedis,match,  msg } = setup()
    const handler = addArtist(fakeBot,fakeRedis)

    return handler(msg,match).then(() => {
      expect(fakeRedis.sadd).toHaveBeenCalledWith(msg.from.id,'12345')
    })
  })

  it('calls bot.sendMessage with the correct arguments', () => {
    const { fakeRedis, fakeBot, match, msg } = setup()
    const handler = addArtist(fakeBot,fakeRedis)

    return handler(msg,match).then(() => {
      expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.chat.id,'Registered your interest in Artist Name')
    })
  })
})
