## Description

Construa um Backend resiliente e escalável com NestJS, RabbitMQ, serviços em cloud[AWS e SAP] e padrões arquiteturais corporativos.

## Scopo

Micro serviço responsável pelo controle dos rankings.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Dependences
- npm install @nestjs/microservices
- npm install amqplib amqp-connection-manager
- npm install npm install @nestjs/mongoose mongoose
- npm install --save-dev @types/mongoose
- npm i @nestjs/config
- npm install moment-timezone
- npm install lodash