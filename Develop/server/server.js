const express = require('express');
const path = require('path');
const db = require('./config/connection');
//don't need or apollo server
// const routes = require('./routes');
const { ApolloServer } = require('apollo-server-express');
//import the graphQL schemas
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

//create a new apollo server and middleware for JSW tokens
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// connecting the apollo server to GraphQL schemas
const startApolloServer = async () => {
  await server.start();
  //connect express server and GraphQL/Apollo server 
  server.applyMiddleware({ app });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//removing since it is part of the rest API and not apollo
// app.use(routes);

//connect to the database and start the server
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
// call the async function to start the server
startApolloServer();