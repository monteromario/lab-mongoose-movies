const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
		type: String,
		required: true,
	},
    genre: {
		type: String,
		required: true,
	},
    plot: {
		type: String,
		required: true,
	},
    /*cast: {
        type: mongoose.SchemaTypes.ObjectId,
		ref: "Celebrity",
		required: true
    },*/
},
{
    toJSON: {
      virtuals: true,
    },
});

movieSchema.virtual('cast', {
  ref: 'Cast',
  foreignField: 'movie',
  localField: '_id'
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;