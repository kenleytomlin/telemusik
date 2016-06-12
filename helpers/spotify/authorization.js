const authorization = (spotify) => {
  return Promise.coroutine(function* () {
    const data = yield spotify.clientCredentialsGrant()
    spotify.setAccessToken(data.body.access_token)
  })
}

export default authorization
