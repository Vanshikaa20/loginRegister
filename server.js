if (process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


const express = require("express")
const app = express()
const bcrypt = require('bcrypt')
const passport = require("passport")
const initalizePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const LocalStrategy = require('passport-local').Strategy;

app.use(express.static('public'));





initalizePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


const users = [];

app.set('view engine', 'ejs'); // Configure EJS as the view engine
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave : false, //we want resave the session variable if nothing is changed
    saveUninitialized : false
}))

app.use(passport.initialize())
app.use(passport.session())



passport.use(new LocalStrategy(
    {
      usernameField: 'email',    // Field name for the email input in your form
      passwordField: 'password', // Field name for the password input in your form
    },

    (email, password, done) => {
        // Implement your authentication logic here
        const user = users.find((user) => user.email === email);
    
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
    
        // Assuming user.password contains the hashed password
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            return done(null, false, { message: 'Incorrect password.' });
          }
    
          // Authentication successful
          return done(null, user);
        });
      }
    // Your authentication logic here
  ));
  
  // Route handling for login
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }));
  
  




// configuring in the register post functionality

app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        console.log(users); // Display newly registered user in console
        res.redirect("/login");
    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

// Routes
app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/register', (req, res) => {
    res.render("register.ejs");
});

app.listen(3000);
