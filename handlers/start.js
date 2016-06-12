const start = (bot) => {
  return Promise.coroutine(function*(msg) {
    const { from: { id, username }, chat } = msg
    const txt = `*Telemusik*\nA Telegram bot that interacts with the spotify api\nWelcome ${username} to get started check the list of commands\n\n_commands:_\n
    /search [artist name] - Returns artists, artists can be added via the keyboard\n
    /recommend - Recommends a list of tracks based on the artists you have added
    `
    const opts = {
      parse_mode: 'Markdown'
    }

    return bot.sendMessage(id,txt,opts)
  })
}

export default start
