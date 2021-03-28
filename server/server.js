const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
//const routes = require('./routes');

const db = require('./config/connection');
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
});
server.applyMiddleware({ app });

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

//app.use(routes);

db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`API server running on: ${PORT}`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
});
