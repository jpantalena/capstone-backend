const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const localAuth = require('./local');

function createUser(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return knex('users')
  .insert({
    username: req.body.username,
    password: hash
  })
  .returning('*');
}

function getUser(username) {
  return knex('users').where({username}).first();
}

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function ensureAuthenticated(req, res, next) {
  console.log(req.headers.authorization)
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({
      status: 'Please log in'
    });
  }
  // decode the token
  const header = req.headers.authorization.split(' ');
  const token = header[1];
  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        return next();
      })
      .catch((err) => {
        res.status(500).json({
          status: 'error'
        });
      });
    }
  });
}

function ensureAuthenticatedCustom(req, res, next) {
  console.log(req.body)
  let token = req.query.token
  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        return next();
      })
      .catch((err) => {
        res.status(500).json({
          status: 'error'
        });
      });
    }
  });
}

module.exports = {
  createUser,
  getUser,
  comparePass,
  ensureAuthenticated,
  ensureAuthenticatedCustom
};
