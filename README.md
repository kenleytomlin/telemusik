##Telemusik - A bot for telegram that interacts with the Spotify API
This is a project that I started at the React Seoul meetup.
I'm hoping that other members might help out adding features or that it
might be helpful to people new to node/javascript.

It uses es6, promises and generators to simplify asynchronous control
flow.  It also displays how you can write tests using techniques like
mocking and spying.

Redis is used as the main data store.

##Running the bot
This project uses docker for development.  You will need to install the
[docker toolbox](https://www.docker.com/products/docker-toolbox) before you get up and running.
Follow the steps in their documentation to install the tools.

Once you have docker up and running and get output from
```sh
docker ps
```

Clone the repo
```sh
git clone git@github.com:kenleytomlin/telemusik.git
```

Create a telegram bot and grab a token for it instructions are
[here](https://core.telegram.org/bots/api#authorizing-your-bot)

Create a spotify app and get a client and spotify client secret (this
isn't entirely necessary but you get an increased request limit).
Instructions can be found
[here](https://developer.spotify.com/web-api/authorization-guide/)

You need to create a file called .env in the root of the project.  Open
this file in your favourite text editor and format it like so:

```
TELEGRAM_TOKEN=<TOKEN_YOU_GOT_WHEN_YOU_CREATED_YOUR_BOT>
SPOTIFY_CLIENT_ID=<CLIENT_ID_YOU_GOT_FROM_SPOTIFY>
SPOTIFY_CLIENT_SECRET=<CLIENT_SECRET_YOU_GOT_FROM_SPOTIFY>
```

Don't commit the .env file to git as you will expose your secrets to the
wide world. (This file is .gitignored)

Ok you should be good to go ahead and run docker-compose

```sh
docker-compose up
```

Docker will have to pull the images it needs for the project to run.
This might take a few minutes.  This only needs to be done once.  Once
the images are downloaded docker will spin up the containers that run
the app.

###Testing
Specs are run using the test runner mocha.  You can run the tests with

```sh
docker-compose run --rm telemusik npm run test:watch
```

This will watch for file changes and rerun the tests each time you save
any of the files.

###Features
So you might be wondering what features are currently implemented

/search - Uses Spotify's artist search to return some results
which generates a keyboard the user can click in the client.

/add - Is used as a response endpoint for /searchArtists.  It takes the
text value slugs it and looks for it in the artist_slug_hash.  It then
saves the artist id to a redis set under the user's id.

And thats it so far....

###Roadmap
1. Leverage the Spotify recommendation engine to pull a list of
songs and push these to users.
2. Checking for updates for artists a user has followed and pushing these to them
3. Managing artists the user follows
4. Authenticating against the spotify API and managing playlists
   / follows etc

