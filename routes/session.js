'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const humps = require('humps');
const boom = require('boom');

router.get('/session', (req, res, next) => {
  if(req.session.userInfo){
    res.send(true)
  }
  else{
    res.send(false)
  }
})

router.post('/session', (req, res, next) => {
  knex('users').where('email', req.body.email)
  .then((results) => {
    if(results.length == 0){
      throw boom.create(400, 'Bad email or password')
    }
    else{
      var user = results[0]
      var pwMatch = bcrypt.compareSync(req.body.password, user.hashed_password)
      if(pwMatch === false){
        throw boom.create(400, 'Bad email or password')
      }
      else{
        delete user.hashed_password
        req.session.userInfo = user
        res.send(humps.camelizeKeys(user))
      }
    }
  })
  .catch((err) => {
    next(err)
  })
})

router.delete('/session', (req, res, next) => {
  req.session = null
  res.send(true)
})

module.exports = router;
