var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email','username', 'password'])) {
    res.json({ result: false, error: 'Champs vides ou manquants' });
    return;
  }
  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {

  // The password is being hashed 10 times before being stored in the database
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,

  // the token is created with 32 random characters
        token: uid2(32),
        canBookmark: true,
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token, message: 'Votre compte a bien été créé !' });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'Utilisateur déjà existant !' });
    }
  });
});

// User already exists in database
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'élément manquant ou champ resté vide' });
    return;
  }
  // The data entered by the user is compared to what's in the database
  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, userId: data._id, });
    } else {
      res.json({ result: false, error: 'Utilisateur introuvable ou mot de passe incorrect' });
    }
  });
});


// Route to get user profile information
router.get('/profile', (req, res) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  console.log(token);
  

  // Check if token exists
  if (!token) {
    return res.status(401).json({ result: false, error: 'Token is required' });
  }

  User.findOne({ token })
    .select('email username') 
    .then(user => {
      if (!user) {
        return res.status(404).json({ result: false, error: 'User not found' });
      } 
      console.log();
      // Return the user data as JSON if found
      res.json({ result: true, user });
    })
});
module.exports = router;
