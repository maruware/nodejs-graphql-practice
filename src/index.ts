const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  input MessageInput {
    content: String
    author: String
  }
 
  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
    ip: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`)

class RandomDie {
  numSides: number
  constructor(numSides: number) {
    this.numSides = numSides
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides)
  }

  roll({ numRolls }: { numRolls: number }) {
    const output = []
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce())
    }
    return output
  }
}

class Message {
  id: string
  content: string
  author: string
  constructor(
    id: string,
    { content, author }: { content: string; author: string }
  ) {
    this.id = id
    this.content = content
    this.author = author
  }
}

const fakeDatabase: any = {}

// The root provides a resolver function for each API endpoint
const root = {
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'
  },
  random: () => {
    return Math.random()
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6))
  },
  rollDice: ({ numDice, numSides }: { numDice: number; numSides?: number }) => {
    const output = []
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)))
    }
    return output
  },
  getDie: ({ numSides }: { numSides?: number }) => {
    return new RandomDie(numSides || 6)
  },
  getMessage: ({ id }: { id: string }) => {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id)
    }
    return new Message(id, fakeDatabase[id])
  },
  createMessage: ({
    input,
  }: {
    input: { content: string; author: string }
  }) => {
    // Create a random id for our "database".
    const id = require('crypto').randomBytes(10).toString('hex')

    fakeDatabase[id] = input
    return new Message(id, input)
  },
  updateMessage: ({
    id,
    input,
  }: {
    id: string
    input: { content: string; author: string }
  }) => {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id)
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input
    return new Message(id, input)
  },
  ip: function (_: any, request: any) {
    return request.ip
  },
}

const app = express()
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4000)
console.log('Running a GraphQL API server at http://localhost:4000/graphql')
