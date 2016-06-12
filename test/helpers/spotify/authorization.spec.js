import authorization from '../../../helpers/spotify/authorization'

describe('helpers/authorization/spotify',() => {

  function setup() {
    const data = {
      body: {
        access_token: 'token-for-spotify'
      }
    }
    const fakeSpotify = {
      clientCredentialsGrant: expect.createSpy().andReturn(Promise.resolve(data)),
      setAccessToken: expect.createSpy()
    }

    return {
      data,
      fakeSpotify
    }
  }

  it('returns a function', () => {
    const { fakeSpotify } = setup()
    const auth = authorization(fakeSpotify)

    expect(auth).toBeA(Function)
  })

  it('calls clientCredentialsGrant', () => {
    const { fakeSpotify } = setup()
    const auth = authorization(fakeSpotify)

    return auth().then(() => {
      expect(fakeSpotify.clientCredentialsGrant).toHaveBeenCalled()
    })
  })

  it('calls setAccessToken', () => {
    const { fakeSpotify, data } = setup()
    const auth = authorization(fakeSpotify)

    return auth().then(() => {
      expect(fakeSpotify.setAccessToken).toHaveBeenCalledWith(data.body.access_token)
    })
  })
})
