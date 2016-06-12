import searchArtists from '../../handlers/searchArtists'

describe('handlers/searchArtists', () => {
  function setup() {
    const searchResponse = {
      body: {
        artists: {
          items: [{
            id: 'artist_id1',
            name: 'Artist Name'
          }, {
            id: 'artist_id2',
            name: 'not an artist'
          }]
        }
      },
      headers: {}
    }
    const msg = {
      text: '/searchArtists Artist Name',
      message_id: 12345,
      chat: {
        id: 12345
      },
      from: {
        id: 98765,
      }
    }
    const match = [
      '/searchArtists',
      'artist name'
    ]
    const sent = {
      message_id: 678910,
    }
    const userMsg = {
      text: 'Artist Name'
    }
    const fakeSpotify = {
      searchArtists: expect.createSpy().andReturn(Promise.resolve(searchResponse))
    }
    const fakeBot = {
      sendMessage: expect.createSpy().andReturn(Promise.resolve(sent))
    }
    const fakeRedis = {
      hmset: expect.createSpy().andReturn(Promise.resolve(2))
    }
    return {
      fakeSpotify,
      fakeBot,
      fakeRedis,
      searchResponse,
      match,
      msg,
      sent,
      userMsg
    }
  }

  it('returns a function',() => {
    const { fakeSpotify, fakeRedis, fakeBot } = setup()
    const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
    expect(handler).toBeA(Function)
  })

  it('calls spotify with the correct arguments',() => {
    const { fakeSpotify, fakeRedis, fakeBot, msg, match } = setup()
    const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
    return handler(msg,match).then(() => {
      expect(fakeSpotify.searchArtists).toHaveBeenCalledWith(match[1])
    })
  })

  context('when there are results from spotify', () => {
    it('calls redis.hmset with the correct arguments', () => {
      const { fakeSpotify, fakeRedis, fakeBot, msg, match } = setup()
      const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
      return handler(msg,match).then(() => {
        expect(fakeRedis.hmset).toHaveBeenCalledWith('artists_slug_hash',{ artist_name: 'artist_id1', not_an_artist: 'artist_id2'})
      })
    })
  })

  context('when there are no results from spotify', () => {
    it('doesn\'t call redis.hmset', () => {
      const { fakeRedis, fakeBot, msg, match } = setup()
      const fakeSpotify = {
        searchArtists: expect.createSpy().andReturn(Promise.resolve({ body: { artists: { items: [] } } }))
      }
      const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
      return handler(msg,match).then(() => {
        expect(fakeRedis.hmset).toNotHaveBeenCalled()
      })
    })

    it('calls bot.sendMessage with the correct arguments', () => {
      const { fakeRedis, fakeBot, msg, match } = setup()
      const fakeSpotify = {
        searchArtists: expect.createSpy().andReturn(Promise.resolve({ body: { artists: { items: [] } } }))
      }
      const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
      return handler(msg,match).then(() => {
        expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.chat.id,`No artists found for ${match[1]}, refine your search and try again`)
      })
    })
  })

  it('calls bot.sendMessage with the correct arguments', () => {
    const { fakeSpotify, fakeRedis, fakeBot, searchResponse, msg, match } = setup()
    const handler = searchArtists(fakeSpotify,fakeBot,fakeRedis)
    const opts = {
      reply_to_message_id: msg.message_id,
      reply_markup: JSON.stringify({
        keyboard: [['/add Artist Name'],['/add not an artist']],
        resize_keyboard: true,
        force_reply: true,
        one_time_keyboard: true
      })
    }
    return handler(msg,match).then(() => {
      expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.chat.id,'Select the artist you are interested in',opts)
    })
  })
})
