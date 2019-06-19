const { gql } = require("apollo-server");

//Create our multiple type definitions with News being our overarching structure
//Within News we have our individual news elements that are articles, videos, or slideshows
//We only have one Query that takes care of fetching or updating the web data

module.exports = gql`
  type News {
    _id: ID,
    news: [Data]
  }

  type Data {
    id: ID,
    type: String,
    url: String,
    headline: String,
    published: String,
    tease: String
  }

  type Query {
    getNews: News
  }
`