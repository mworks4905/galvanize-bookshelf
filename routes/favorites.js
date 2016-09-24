'use strict';

const express = require('express');
const router = express.Router();
const boom = require('boom')
const knex = require('../knex')
const humps = require('humps')


const authorize = function(req, res, next) {
    if (!req.session.userInfo) {
        throw boom.create(401, 'Unauthorized')
    } else {
        next()
    }
}

router.get('/favorites', authorize, (req, res, next) => {
    knex('favorites')
        .innerJoin('books', 'books.id', 'favorites.book_id')
        .where('favorites.user_id', req.session.userInfo.id)
        .then((book) => {
            res.send(humps.camelizeKeys(book))
        })
        .catch((err) => {
            next(err)
        })
})


router.get('/favorites/check', authorize, (req, res, next) => {
    const bookId = Number.parseInt(req.query.bookId);

    if (!Number.isInteger(bookId)) {
        return next(boom.create(400, 'Book ID must be an integer'));
    }

    knex('books')
        .innerJoin('favorites', 'favorites.book_id', 'books.id')
        .where('books.id', bookId)
        .then((book) => {
            if (book.length === 0) {
                return res.send(false);
            }
            res.send(true);
        })
        .catch((err) => {
            next(err);
        });
});

router.post('/favorites', authorize, (req, res, next) => {
    knex('favorites')
        .insert({
            book_id: req.body.bookId,
            user_id: req.session.userInfo.id
        }, '*')
        .then((book) => {
            res.send(humps.camelizeKeys(book[0]))
        })
})

router.delete('/favorites', authorize, (req, res, next) => {
    let favorite
    knex('favorites')
        .where('book_id', req.body.bookId)
        .returning(['book_id', 'user_id'])
        .del()
        .then((book) => {
            if (!book) {
                throw boom.create(404, 'Favorite not found')
            }
            favorite = humps.camelizeKeys(book[0])
            res.json(favorite);
        })
})

module.exports = router;