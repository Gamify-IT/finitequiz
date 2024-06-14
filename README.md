# Finitequiz

![game screenshot](https://raw.githubusercontent.com/Gamify-IT/docs/main/user-manuals/minigames/assets/finitequiz-game.webp)
This repository contains the frontend for the [Finitequiz minigame](https://gamifyit-docs.readthedocs.io/en/latest/user-manuals/minigames/finitequiz.html).

# Table of contents

<!-- TOC -->
* [Links](#links)
* [Development](#development)
  * [Getting started](#getting-started)
    * [Run with Docker-compose](#run-with-docker-compose)
  * [Compile and Hot-Reload for Development](#compile-and-hot-reload-for-development)
  * [Test](#test)
  * [Build](#build)
<!-- TOC -->

## Links

- User documentation for the minigame can be found [here](https://gamifyit-docs.readthedocs.io/en/latest/user-manuals/minigames/finitequiz.html).
- For the backend, see the [Gamify-IT/finitequiz-backend repository](https://github.com/Gamify-IT/finitequiz-backend).
- The installation manual and setup instructions can be found [here](https://gamifyit-docs.readthedocs.io/en/latest/install-manuals/index.html).

## Development

### Getting started

Clone the repository  
```sh
git clone https://github.com/Gamify-IT/finitequiz.git
```

Install the dependencies  
```sh
npm install
```

#### Run with Docker-compose

Start all dependencies with our docker-compose files.
Check the [manual for docker-compose](https://github.com/Gamify-IT/docs/blob/main/dev-manuals/languages/docker/docker-compose.md).

### Compile and Hot-Reload for Development

```sh
npm run serve
```

### Test

Run the tests:
```sh
npm run test:unit
```

To also get the test coverage:
```sh
npm run test:unit -- --coverage
```

### Build

Build the Docker-Container
```sh
docker build -t finitequiz-dev .
```
And run it at port 8000 with
```sh
docker run -d -p 8000:80 --name finitequiz-dev finitequiz-dev
```

To monitor, stop and remove the container you can use the following commands:
```sh
docker ps -a -f name=finitequiz-dev
```
```sh
docker stop finitequiz-dev
```
```sh
docker rm finitequiz-dev
```

## Audio sources 

1.	Background music
https://pixabay.com/de/music/schlagt-hail-126903/

2.	Answer click sound
https://pixabay.com/de/sound-effects/interface-124464/

3.	Button click sound
https://pixabay.com/de/sound-effects/interface-button-154180/

4.	Correct answer 
https://mixkit.co/free-sound-effects/correct/   (mixkit-correct-answer-tone-2870)

5.	End screen sound
https://mixkit.co/free-sound-effects/win/   (mixkit-melodic-bonus-collect-1938)

6.	Wrong answer 
https://pixabay.com/de/sound-effects/error-126627/
