const express = require('express');
const router = express.Router();

const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');
const knex = require('../db/connection');


router.post('/register', (req, res, next)  => {
  return authHelpers.createUser(req, res)
  .then((user) => { return localAuth.encodeToken(user[0]); })
  .then((token) => {
    res.status(200).json({
      username: req.body.username,
      status: 'success',
      token: token
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error'
    });
  });
});

router.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  return authHelpers.getUser(username)
  .then((response) => {
    if (authHelpers.comparePass(password, response.password)) {
      return response;
    } else {
      throw new Error('abort promise');
      return null;
    }
  })
  .then((response) => {
    return localAuth.encodeToken(response);
  })
  .then((token) => {
    res.status(200).json({
      username: req.body.username,
      status: 'success',
      token: token
    });
  })
  .catch((err) => {
    if (err.message === 'abort promise') {
      res.status(200).json({
        status: 'error'
      });
    } else {
      res.status(500).json({
        status: 'error'
      });
    }

  });
});

router.get('/user',
  authHelpers.ensureAuthenticated,
  (req, res, next)  => {
  res.status(200).json({
    status: 'success'
  });
});

router.get('/usercheck', authHelpers.ensureAuthenticatedCustom, (req, res, next) => {
  res.status(200).json({
    status: 'success'
  });
})

router.get('/userinfo', (req, res, next) => {
  const header = req.headers.authorization.split(' ');
  const token = header[1];
  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      console.log("Error on getUserInfo")
    } else {
      return knex('regulator_users').where({id: parseInt(payload.sub)}).first()
      .then((data) => {
        res.status(200).json({
          username: data.username
        })
      })
    }
  })
})

module.exports = router;
