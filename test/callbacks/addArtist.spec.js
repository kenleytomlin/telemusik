import { ADD_ARTIST } from '../../constants/callbackTypes'
import addArtist from '../../callbacks/addArtist'

describe('callbacks/addArtist', () => {

  function setup() {
    const fakeRedis = {
      sadd: expect.createSpy().andReturn(Promise.resolve(1)),
      hget: expect.createSpy().andReturn(Promise.resolve('Artist Name'))
    }
    const fakeBot = {
      sendMessage: expect.createSpy().andReturn(Promise.resolve())
    }
    const msg = {
      from: {
        id: 98765
      },
      message: {
        chat: {
          id: 98760
        }
      }
    }
    const data = {
      artist_id: 54321,
      artist_name: 'Artist Name',
      type: 'ADD_ARTIST'
    }

    return {
      data,
      fakeRedis,
      fakeBot,
      msg
    }
  }

  it('returns a function', () => {
    const { fakeRedis, fakeBot, msg, data } = setup()

    const cb = addArtist({ bot: fakeBot, redis: fakeRedis })
    expect(cb).toBeA(Function)
  })

  it('calls redis.sadd with the correct arguments', () => {
    const { fakeRedis, fakeBot, msg, data } = setup()

    const cb = addArtist({ bot: fakeBot, redis: fakeRedis })
    return cb(msg,data).then(() => {
      expect(fakeRedis.sadd).toHaveBeenCalledWith(msg.from.id,data.aid)
    })
  })

  it('calls redis.hget with the correct arguments', () => {
    const { fakeRedis, fakeBot, msg, data } = setup()

    const cb = addArtist({ bot: fakeBot, redis: fakeRedis })
    return cb(msg,data).then(() => {
      expect(fakeRedis.hget).toHaveBeenCalledWith('artists_hash',data.aid)
    })
  })

  it('calls bot.sendMessage with the correct arguments', () => {
    const { fakeRedis, fakeBot, msg, data } = setup()

    const cb = addArtist({ bot: fakeBot, redis: fakeRedis })
    return cb(msg,data).then(() => {
      expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.message.chat.id,`Registered your interest in ${data.artist_name}`)
    })
  })
})
