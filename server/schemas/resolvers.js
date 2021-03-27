const resolvers = {
    Query: {
        helloWorld: () => {
          return 'Greetings!';
        }
    }
};

module.exports = resolvers;