const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const localAuth = require('../auth/local');
const uuidV4 = require('uuid/v4');
const entries = require('object.entries');

router.get('/', function (req, res, next) {
  res.send('What Up')
});

router.get('/test', function (req, res, next) {
  res.send('This is a test')
});

router.post('/tab', (req, res, next)  => {
  var arr = entries(req.body);
  var token = req.body.token;
  var user_id = null;
  arr.pop();
  let queries = [];
  var id = uuidV4();

  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        return knex('tabs')
        .insert({
          id: id,
          author_id: user.id
        })
        .then(() => {
          for (let i = 0; i < arr.length; i = i + 3) {
            let query = knex('tab_info').insert({tab_id: id, time: arr[i][1], string: arr[i+1][1], fret: arr[i+2][1]});
            queries.push(query);
          }
        })
        .then(() => {
          Promise.all(queries).then(() => {
            res.status(200).json({
              status: 'success',
            });
          })
        })
      })
      .catch((err) => {
        res.status(500).json({
          status: 'error'
        });
      });
    }
  });
});

router.post('/tabDelete', (req, res, next) => {
  var deleteID = req.body.tab_id;
  knex('tabs').where({id: deleteID}).del()
  .then(() => {
    knex('tab_info').where({tab_id: deleteID}).del()
    .then(() => {
      res.status(200).json({
        status: 'success',
      });
    })
  })
})

router.get('/getTabs', (req, res, next) => {
  var token = req.query.token;
  var tabs = [];
  var tab_info = [];
  var qs = [];
  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        return knex('tabs').where({author_id: user.id}).select('id')
        .then((data) => {
          for (let i = 0; i < data.length; i++) {
            let current = data[i].id;
            tabs.push(current);
          }
        })
        .then(() => {
          for (let j = 0; j < tabs.length; j++) {
            let cur = tabs[j];
            let q = knex('tab_info').where({tab_id: cur}).select('time', 'string', 'fret', 'tab_id')
            qs.push(q);
          }
        })
        .then(() => {
          Promise.all(qs).then((tab_details) => {
            res.status(200).json({
              status: 'success',
              data: tab_details
            });
          })
        })
      })
    }
  })
})


module.exports = router;
