# Lecturer-Interface

An easy to use interface that lecturers can use to configure the areas of the overworld and the shown minigames.

## Development

### Getting started

Clone the repository  
```sh
git clone https://github.com/Gamify-IT/lecturer-interface.git
```

Install the dependencies  
```sh
npm install
```

#### Run with Docker-compose

Start all dependencies with our docker-compose files.
Check the [manual for docker-compose](https://github.com/Gamify-IT/docs/blob/main/dev-manuals/docker-compose/docker-compose.md).

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
docker build -t lecturer-interface-dev .
```
And run it at port 8000 with
```sh
docker run -d -p 8000:80 --name lecturer-interface-dev lecturer-interface-dev
```

To monitor, stop and remove the container you can use the following commands:
```sh
docker ps -a -f name=lecturer-interface-dev
```
```sh
docker stop lecturer-interface-dev
```
```sh
docker rm lecturer-interface-dev
```

## User manual

Run the docker container with the following command at port 8000:
```sh
docker run -d -p 8000:80 --name lecturer-interface ghcr.io/gamify-it/lecturer-interface:latest
```
Now you can access it at [http://localhost:8000](http://localhost:8000).  
To access it externally replace localhost with your IP.  

To monitor the container you can use the following command:
```sh
docker ps -a -f name=lecturer-interface
```
To stop the container you can use the following command:
```sh
docker stop lecturer-interface
```
To remove the container you can use the following command:
```sh
docker rm lecturer-interface
```

### Screenshot
![Image](https://user-images.githubusercontent.com/39833217/178007768-a4f20b6d-5348-48e6-89a2-6956d15ea065.png)