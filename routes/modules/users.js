const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const User = require('../../models/user')

// User login route (GET)
router.get('/login', (req, res) => {
  res.render('login')
})
// Validate user login request (POST)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

// User registration route (GET)
router.get('/register', (req, res) => {
  res.render('register')
})

// Register user information (POST)
router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (!email || !password || !confirmPassword) {
    errors.push({ message: '請完成所有必填欄位' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不相符！' })
  }
  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }
  // Check if the user is already registered
  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ message: '這個 Email 已經註冊過了。' })
      res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }
    // If the user is not registered, create a new user in the database
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
    .catch(err => console.log(err))
})

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return;
    }
    req.flash('success_msg', '你已經成功登出。');
    res.redirect('/users/login');
  });
});

module.exports = router