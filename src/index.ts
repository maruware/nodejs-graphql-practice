const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`)

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return 'Hello world!'
  },
  rollDice: ({ numDice, numSides }: { numDice: number; numSides?: number }) => {
    const output = []
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)))
    }
    return output
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
