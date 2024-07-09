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
> Beginning of additions (that work)
### Getting started

Clone the repository
```sh
git clone https://github.com/Gamify-IT/finitequiz.git
```

Install the dependencies
```sh
npm install
```

### Compile and Hot-Reload for Development
To run the project locally with your IDE feature and have all necessary dependencies running,
start the dependencies via docker:
```sh
docker compose -f docker-compose-dev.yaml up
```
Then start the frontend with:
```sh
npm run serve
```
You can now access the game at [localhost](http://localhost).

### Build your local changes as a docker container
To build and run your local changes as a docker container use:
```sh
docker compose up --build
```
You can remove the container with:

```sh
docker compose down
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

2.	Click sound
https://pixabay.com/de/sound-effects/interface-button-154180/

3.	Correct answer 
https://mixkit.co/free-sound-effects/correct/   (mixkit-correct-answer-tone-2870)

4.	End screen sound
https://mixkit.co/free-sound-effects/win/   (mixkit-melodic-bonus-collect-1938)

5.	Wrong answer 
https://pixabay.com/de/sound-effects/error-126627/

> End of additions

