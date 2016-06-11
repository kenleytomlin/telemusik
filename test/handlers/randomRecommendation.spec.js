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
      msg
    }
  }

  it('returns a function', () => {
    const { fakeSpotify, fakeRedis, fakeBot } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis)
    expect(handler).toBeA(Function)
  })

  it('calls redis.srandmember', () => {
    const { fakeSpotify, fakeRedis, fakeBot, msg  } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis)

    return handler(msg).then(() => {
      expect(fakeRedis.srandmember).toHaveBeenCalledWith(msg.from.id,5)
    })
  })

  it('calls spotify.getRecommendations with the correct arguments', () => {
    const { fakeSpotify, fakeRedis, fakeBot, msg, fiveArtistIds } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis)

    return handler(msg).then(() => {
      expect(fakeSpotify.getRecommendations).toHaveBeenCalledWith({ min_energy: 0.4, seed_artists: fiveArtistIds, limit: 5, min_popularity: 50 })
    })
  })

  it('calls fakeBot.sendMessage with the correct arguments', () => {
    const { fakeSpotify, fakeRedis, fakeBot, msg, recommendationResponse, fiveArtistIds } = setup()
    const handler = randomRecommendation(fakeSpotify,fakeBot,fakeRedis)

    const opts = {
      parse_mode: 'Markdown'
    }

    const md = `
      *${recommendationResponse.body.tracks[0].name}*
      By ${recommendationResponse.body.tracks[0].artists[0].name}
      [Preview Link](${recommendationResponse.body.tracks[0].preview_url})
      `

    return handler(msg).then(() => {
      expect(fakeBot.sendMessage).toHaveBeenCalledWith(msg.from.id,md,opts)
    })
  })
})
