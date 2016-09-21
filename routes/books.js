'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex')
const humps = require('humps')

router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(humps.camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', (req, res, next) => {
    knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }
      res.send(humps.camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  var insertBook = {
    id: req.body.id,
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    description: req.body.description,
    cover_url: req.body.cover_url,
  }
  knex('books').insert(humps.decamelizeKeys(req.body), 'id')
    .then((num) => {
      var id = num[0]
      knex('books').where('id', id).first().then((insertBook) => {
        res.json(humps.camelizeKeys(insertBook))
      })
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  var id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }

      var { title, author, genre, description, coverUrl } = req.body;
      var updateBook = {};

      if (title) {
        updateBook.title = title;
      }
      if (author) {
        updateBook.author = author;
      }
      if (genre) {
        updateBook.genre = genre;
      }
      if (description) {
        updateBook.description = description;
      }
      if (coverUrl) {
        updateBook.coverUrl = coverUrl;
      }
      return knex('books')
        .update(humps.decamelizeKeys(updateBook), '*')
        .where('id', id);
    })
    .then((rows) => {
      var book = humps.camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res) => {
  knex('books')
  .returning(['title', 'author', 'genre', 'description', 'cover_url'])
  .where('id', req.params.id).del().then((book) => {
    res.send(humps.camelizeKeys(book[0]));
  });
});

// router.delete('/:id', (req, res) => {
//   var id = Number.parseInt(req.params.id)
//   if(Number.isNaN(id)){
//     return next();
//   }
//
//   knex('books')
//   .where('id', id)
//   .first()
//   .then((row) => {
//     if (!row) {
//       throw err(404);
//     }
//   })
//
//   knex('books')
//   .returning(['title', 'author', 'genre', 'description', 'cover_url'])
//   .where('id', id)
//   .del()
//   .then((book) => {
//     res.send(humps.camelizeKeys(book[0]));
//   })
//   .catch((err) => {
//     next(err);
//   });
// });

module.exports = router;
