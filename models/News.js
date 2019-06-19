const mongoose = require("mongoose");
var Schema = mongoose.Schema;

//This files whole purpose is to establish a very loose Schema for our data to be stored in, the actual schema type creation is don
//by GraphQl
const NewsSchema = new mongoose.Schema(
  {
    news: Schema.Types.Mixed //This allows our news array to contain any type we need.
  },
  { timestamps: { createdAt: "created_at" } } //Create a timestamp for whenever the data is fetched or updated
);

module.exports = mongoose.model("News", NewsSchema);
