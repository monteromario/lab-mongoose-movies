const mongoose = require('mongoose');

const Movie = require("./movie");

const celebritySchema = new mongoose.Schema({
    name: {
		type: String,
		required: true,
	},
    occupation: {
		type: String,
		required: true,
	},
    catchPhrase: {
		type: String,
		required: true,
	},
},
    {
    toJSON: {
      virtuals: true,
    },
});

celebritySchema.virtual('cast', {
  ref: 'Cast',
  foreignField: 'celebrity',
  localField: '_id'
});

celebritySchema.virtual("movies", {
  ref: "Movie",
  foreignField: "cast",
  localField: "_id",
});

const Celebrity = mongoose.model("Celebrity", celebritySchema);

module.exports = Celebrity;