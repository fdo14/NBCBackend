const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

//Set up our database connection
mongoose
  .connect("mongodb://fdo14:password1@ds239797.mlab.com:39797/nbc", {
    useNewUrlParser: true
  })
  .then(() => console.log("DB connected!"))
  .catch(err => console.log(err));

//Register Apollo and link up our typeDefs and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

//Set the server to listening
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Listening on ${url}`);
});