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


// route to update users' email and username

router.put('/update', authMiddleware, async (req, res) => {
  try {
    // AuthMiddleware checks that the user is authenticated and then extracts the user ID from the request
    const userId = req.user.id;
    const { email, username } = req.body; // Extracts the email and username from the request body

    // Check the email and username
    if (!email || !username) {
      return res.status(400).json({ message: 'Email et nom d’utilisateur requis' });
    }

    // Update the user email and username
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, username },
      { new: true, runValidators: true } // Returns the user with the updated email and username
    );

    // Check if the user was updated
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Returns the updated user data
    res.json({
      message: 'Informations mises à jour avec succès',
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’utilisateur :', error);
    res.status(500).json({ message: "Erreur du serveur lors de la mise à jour de l'utilisateur" });
  }
});

module.exports = router;
