var express = require("express")

var app = express();
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieSession({secret: "string"}));

var PORT = 8081;

app.set("view engine", "ejs")
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
let urlDataBase = {
  "b2xVn2": {
   longURL : "http://www.lighthouselabs.ca",
   userId : "userRandomID"
 },
 "9sm5xK": {
  longURL: "http://www.google.com",
  userId : "user2RandomID"
 }
};


function findURLS(userId) {
  var filterDatabase = [];
  for (var shortkey in urlDataBase) {                               //iterating through each object(2)
    if(userId === urlDataBase[shortkey].userId) {
      let data = urlDataBase[shortkey];                      //var data = is the object containing longurl and userid
      data['shortURL'] = shortkey                   // add the key shorturl to data and = the (keys) we iterate through
      filterDatabase.push(data);
    }
  }
  return filterDatabase;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("abss", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("flksjlsj", 10)
  }
}


app.get("/", (req, res) => {
  res.send("Hello!")

})

app.get("/urls.json", (req,res) => res.json(urlDataBase))
                                                                        //respond with json version of urlDataBase

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls", (req, res) => {
  let templateVars = {
    filterDatabase: null,
    userId: null
  }
  if(req.session.userId === undefined ){
  } else {
    let filterData = findURLS(req.session.userId)
    templateVars['filterDatabase'] = filterData;
    templateVars['userId'] = users[req.session.userId]

   }

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req,res) => {
if(!req.session['userId']) {
  res.redirect("/login")
}
let templateVars = {
    urls: urlDataBase,
    userId: users[req.session.userId]
   };
   res.render("urls_new", templateVars)

})


app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id
  let templateVars = {
    shortURL : shortURL,
    longURL : urlDataBase[shortURL].longURL,
    userId: users[req.session.userId]
  }
  if (!urlDataBase[shortURL]) {
    res.send("URL for given ID does not exist!")

  }
  else if (!req.session.userId) {
    res.send("Please Log in to see this URL.")
  }
  else if(req.session.userId === urlDataBase[shortURL].userId) {
    res.render('urls_show', templateVars)
  } else {
    res.send("This URL does not belong to you")
  }
})



app.get("/u/:shortURL", (req, res) => {
 var shortURL = req.params.shortURL
  let longURL = urlDataBase[shortURL].longURL
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('urls_emailpassword')
})

app.post('/register', (req, res) => {
  var email = req.body.email
  var password = req.body.password
  var random = generateRandomString()
  if (!email || !password) {
    return res.status(400).send("fill in all fields")
  }
    for (key in users) {
    if (email === users[key].email) {
      res.status(400).send("email already exists")
    }
  }
  users[random] = {
    id: random,
    email: email,
    password : password
  }
  var cookieID = users[random].id
  req.session.userId = cookieID
  res.redirect("/urls")

})

app.post("/urls", (req, res) => {
  var rando = generateRandomString()
  const longURL = req.body.longURL
  const userId = req.session.userId                  // KEY PART IS THAT CONSOLE.LOG ON TERMINAL WHAT U SUBMIT.
 urlDataBase[rando] = {
  longURL: longURL,
  userId: req.session.userId
}
  res.redirect(`/urls/${rando}`)
                                         // {longURL : what you typed in the req body }  //  .longurl u get the value of it which is what
});                                                                   // u submit

app.post("/urls/:id/delete", (req,res) => {
  var shortURL = req.params.id;
  if (req.session.userId === urlDataBase[shortURL].userId) {
    delete urlDataBase[shortURL]
     res.redirect(`/urls`)
  } else {
    res.send("fam you don't have permission to delete me!")
  }
})

app.post("/urls/:id", (req, res) => {
   var id = req.params.id
   urlDataBase[id].longURL = req.body.longURL
   res.redirect("/urls")

})

app.get('/login', (req, res) => {
  res.render('loginpage')
})
app.post("/login", (req, res) => {
  const names = req.body.names
  const email = req.body.email
  const password = req.body.password
  for (key in users) {
    if (email === users[key].email && bcrypt.compareSync(password, users[key].password)) {
      req.session.userId = key
      res.redirect('/urls')
    }
  } if (email !== users[key].email && password !== users[key].password) {
    return res.status(403).send("Incorrect Email or Password")
  }

})

app.post("/logout", (req, res) => {
  req.session.userId = null
  res.status(302).redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Tiny App listening on Port ${PORT}`)
})



