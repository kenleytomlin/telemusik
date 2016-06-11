import randomRecommendation from '../../handlers/randomRecommendation'

describe('handlers/randomRecommendation', () => {

  function setup() {
    const recommendationResponse = {
      body: {
        tracks: [
          {
            album: { name: 'Album Name' },
            artists: [{ id: '0987654321', name: 'Artist One' }],
            name: 'Track One',
            popularity: 80,
            preview_url: 'http://preview.url',
            track_number: 1,
            id: '1234567890'
          }
        ],
        seeds: []
      }
    }
    const fiveArtistIds = [
      '123',
      '456',
      '789',
      'abc',
      'def'
    ]
    const fakeSpotify = {
      getRecommendations: expect.createSpy().andReturn(Promise.resolve(recommendationResponse))
    }
    const fakeBot = {
      sendMessage: expect.createSpy().andReturn(Promise.resolve())
    }
    const fakeRedis = {
      srandmember: expect.createSpy().andReturn(Promise.resolve(fiveArtistIds))
    }
    const fakeAuthHelper = expect.createSpy().andReturn(Promise.resolve())

    const msg = {
      message_id: 12345,
      chat: {
        id: 54321
      },
      from: {
        id: 67890
      }
    }

    return {
      recommendationResponse,
      fiveArtistIds,
      fakeSpotify,
      fakeBot,
      fakeRedis,
      fakeAuthHelper,
      msg
    }
  }

  it('returns a function', () => {
    const { fakeSpotify, fakeRedis, fakeBot, fakeAuthHelper } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis,fakeAuthHelper)
    expect(handler).toBeA(Function)
  })

  it('calls redis.srandmember', () => {
    const { fakeSpotify, fakeRedis, fakeBot, fakeAuthHelper, msg } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis,fakeAuthHelper)

    return handler(msg).then(() => {
      expect(fakeRedis.srandmember).toHaveBeenCalledWith(msg.from.id,5)
    })
  })

  it('calls spotify.getRecommendations with the correct arguments', () => {
    const { fakeSpotify, fakeRedis, fakeBot, msg, fakeAuthHelper, fiveArtistIds } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis,fakeAuthHelper)

    return handler(msg).then(() => {
      expect(fakeSpotify.getRecommendations).toHaveBeenCalledWith({ min_energy: 0.4, seed_artists: fiveArtistIds.join(','), limit: 5, min_popularity: 50 })
    })
  })

  context('when the client is authorized', () => {
    it('calls fakeBot.sendMessage with the correct arguments', () => {
      const { fakeSpotify, fakeRedis, fakeBot, msg, recommendationResponse, fakeAuthHelper, fiveArtistIds } = setup()
      const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis,fakeAuthHelper)

      const opts = {
        parse_mode: 'Markdown'
      }

      const md = `*${recommendationResponse.body.tracks[0].name}*\nBy ${recommendationResponse.body.tracks[0].artists[0].name}\n[Preview Link](${recommendationResponse.body.tracks[0].preview_url})`

      return handler(msg).then(() => {
        expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.from.id,md,opts)
      })
    })
  })

  context('when the client isn\'t authorized', () => {
    it('calls authorization helper', () => {
      const { fakeRedis, fakeBot, fakeAuthHelper, recommendationResponse, msg } = setup()
      let x = 0
      const fakeSpotify = {
        getRecommendations: expect.createSpy().andCall(() => {
          if(x == 0) {
            x++
            return Promise.reject({ name: 'WebApiError', message: 'No Token Provided', statusCode: 401 })
          } else {
            return Promise.resolve(recommendationResponse)
          }
        })
      }
      const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis,fakeAuthHelper)

      return handler(msg).then(() => {
        expect(fakeAuthHelper).toHaveBeenCalled()
      })
    })
  })
})
