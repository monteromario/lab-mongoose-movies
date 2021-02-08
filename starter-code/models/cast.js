const mongoose = require('mongoose')

const castSchema = mongoose.Schema({
  movie: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Movie',
    required: true
  },
  celebrity: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Celebrity',
    required: true
  }
})

const Cast = mongoose.model('Cast', castSchema)

module.exports = Cast