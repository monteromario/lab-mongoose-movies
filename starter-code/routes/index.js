const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const Celebrity = require("../models/celebrity");
const Movie = require("../models/movie");
const Cast = require("../models/cast");
const User = require("../models/user");


const isAuthenticated = (req, res, next) => {
  if (req.session.currentUserId) {
    next()
  } else {
    res.redirect('/login')
  }
}

const isNotAuthenticated = (req, res, next) => {
  if (req.session.currentUserId) {
    res.redirect('/profile')
  } else {
    next()
  }
}

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/celebrities', (req, res, next) => {
  Celebrity.find(
    req.query.name
      ? {
          name: { $regex: req.query.name, $options: "i" },
        }
      : {}
  )
  .then((celebrities) => {
    const results = celebrities.length;
    res.render('../views/celebrities/index', {celebrities: celebrities, celebrity_search: req.query.name, results: results});
  })
  .catch((e) => next(e));
})


router.get('/movies', (req, res, next) => {
  Movie.find(
    req.query.title
      ? {
          title: { $regex: req.query.title, $options: "i" },
        }
      : {}
  )
  .populate("cast")
  .then((movies) => {
    const results = movies.length;
    res.render('../views/movies/index', {movies: movies, movie_search: req.query.title, results: results});
  })
  .catch((e) => next(e));
})

router.post('/celebrities/:id/delete', (req, res, next) => {
  const celebrity = req.body;
  Celebrity.findOneAndRemove({ _id: celebrity._id })
  .then(() => {
    res.redirect('/celebrities');
  })
  .catch((e) => next(e));
})

router.post('/movies/:id/delete', (req, res, next) => {
  const movie = req.body;
  Movie.findOneAndRemove({ _id: movie._id })
  .then(() => {
    res.redirect('/movies');
  })
  .catch((e) => next(e));
})

router.post('/cast/:id/delete', (req, res, next) => {
  const cast = req.body;
  Cast.findOneAndRemove({ _id: cast.id })
  .then(() => {
    res.redirect('/cast');
  })
  .catch((e) => next(e));
})

router.post('/celebrities/:id', (req, res, next) => {
  const celebrity = req.body;
  Celebrity.findByIdAndUpdate(req.body._id, celebrity, { new: true })
  .then((c) => {
    let route = '/celebrities/'+celebrity._id;
    return route
  })
  .then((route) => {
    res.redirect(route);
  })
  .catch((e) => next(e));
})

router.post('/movies/:id', (req, res, next) => {
  const movie = req.body;
  Movie.findByIdAndUpdate(req.body._id, movie, { new: true })
  .then((c) => {
    let route = '/movies/'+movie._id;
    return route
  })
  .then((route) => {
    res.redirect(route);
  })
  .catch((e) => next(e));
})

router.post('/celebrities', (req, res, next) => {
  const celebrity = req.body;
  Celebrity.create(celebrity)
  .then(() => {
    return Celebrity.find({name: req.body.name})
    })
  .then((c) => {
    let route = '/celebrities/'+c[0]._id;
    return route
  })
  .then((route) => {
    res.redirect(route);
  })
  .catch((e) => next(e));
})

router.post('/movies', (req, res, next) => {
  const movie = req.body;
  Movie.create(movie)
  .then(() => {
    return Movie.find({title: req.body.title})
    })
  .then((m) => {
    let route = '/movies/'+m[0]._id;
    return route
  })
  .then((route) => {
    res.redirect(route);
  })
  .catch((e) => next(e));
})

router.post('/cast', (req, res, next) => {
  const cast = req.body;
  Cast.create(cast)
  .then(() => {
    res.redirect('/cast');
  })
  .catch((e) => next(e));
})

router.post('/register', (req, res, next) => {
    
  function renderWithErrors(errors) {
      res.status(400).render('../views/user/register', {
      errors: errors,
      user: req.body
      })
  }

  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        renderWithErrors({
          username: 'Username already exist. Try with a different one.'
        })
      } else {
        User.create(req.body)
          .then(() => {
            res.redirect('/profile')
          })
          .catch(e => {
            if (e instanceof mongoose.Error.ValidationError) {
              renderWithErrors(e.errors)
            } else {
              next(e)
            }
          })
      }
    })
    .catch(e => next(e))
});

router.post('/login', (req, res, next) => {

  function renderWithErrors() {
    res.render('../views/user/login', {
      user: req.body,
      error: 'Wrong username or password. Try again.'
    })
  }

  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        renderWithErrors()
      } else {
        user.checkPassword(req.body.password)
          .then(match => {
            if (match) {
              req.session.currentUserId = user.id
              res.redirect('/profile')
            } else {
              renderWithErrors()
            }
          })
      }
    })
    .catch(e => next(e))
})

router.post('/logout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/login')
})

router.get('/celebrities/new', (req, res, next) => {
  res.render('../views/celebrities/new')
})

router.get('/movies/new', (req, res, next) => {
  Celebrity.find()
  .then((celebrities) => {
    res.render('../views/movies/new', {celebrities})
  })
})

router.get('/celebrities/:id/edit', (req, res, next) => {
  Celebrity.findById(req.params.id)
  .then((celebrity) => {
    res.render('../views/celebrities/edit', {celebrity});
  })
  .catch((e) => next(e));
})

router.get('/movies/:id/edit', (req, res, next) => {
  Movie.findById(req.params.id)
    .populate("cast")
    .then((movie) => {
      Celebrity.find()
      .then((celebrities) => {
        res.render('../views/movies/edit', {movie, celebrities});
      })
    })
  .catch((e) => next(e));
})

router.get('/celebrities/:id', (req, res, next) => {
  Celebrity.findById(req.params.id)
  .populate({
      path: 'cast',
      populate: {
        path: 'movie'
      }
    })
  .then((celebrity) => {
    res.render('../views/celebrities/show', {celebrity});
  })
  .catch((e) => next(e));
})

router.get('/movies/:id', (req, res, next) => {
  Movie.findById(req.params.id)
  .populate({
      path: 'cast',
      populate: {
        path: 'celebrity'
      }
    })
  .then((movie) => {
    res.render('../views/movies/show', {movie});
  })
  .catch((e) => next(e));
})

router.get('/cast/new', (req, res, next) => {
  Movie.find()
    .then((movies) => {
      Celebrity.find()
      .then((celebrities) => {
        res.render('../views/cast/new', {movies, celebrities});
      })
    })
})

router.get('/cast', (req, res, next) => {
  Cast.find()
  .populate({
      path: 'celebrity',
      populate: {
        path: 'celebrity'
      }
    })
  .populate({
    path: 'movie',
    populate: {
      path: 'movie'
    }
  })
  .then((cast) => {
    res.render('../views/cast/index', {cast});
  })
  .catch((e) => next(e));
})

router.get('/register', isNotAuthenticated, (req, res, next) => {
  res.render('../views/user/register')
})

router.get('/login', isNotAuthenticated, (req, res, next) => {
  res.render('../views/user/login')
})

router.get('/profile', isAuthenticated, (req, res, next) => {
  res.render('../views/user/profile')
})

module.exports = router;
