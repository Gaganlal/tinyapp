var express = require("express")

var app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

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

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


app.get("/", (req, res) => {                                            //YOU ARE ADDING ADDITIONAL ENDPOINTS through adding paths
  res.send("Hello!")

})

app.get("/urls.json", (req,res) => res.json(urlDataBase))               //get retrieves something, using the PATH.
                                                                        //respond with json version of urlDataBase if u use /urls.json path

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")              //.send is basically saying post this on the page when u search it
})

app.get("/urls", (req, res) => {
  // let username;
  // if(req.cookies) {

  // }
  // console.log( req.cookies && req.cookies['username'] )
  let templateVars = {
    urls: urlDataBase,
    username: req.cookies.username
   };                         //passing the urls data (urlDataBase) to the template urls_index
  res.render("urls_index", templateVars);                                 //by storing as variable templateVars
});

app.get("/urls/new", (req,res) => {
let templateVars = {
    urls: urlDataBase,
    username: req.cookies.username
   };
   res.render("urls_new", templateVars)

})

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL : req.params.id,
    longURL : urlDataBase,
    username: req.cookies.username
  }
  res.render('urls_show', templateVars)
})

app.get("/u/:shortURL", (req, res) => {
 var shortURL = req.params.shortURL
  let longURL = urlDataBase[shortURL]
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('urls_emailpassword')
})

app.post('/register', (req, res) => {
  console.log(req.body)
  var email = req.body.email
  var password = req.body.password
  var random = generateRandomString()
  if (!email || !password) {
    res.status(400).send("fill in fool")
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
  console.log(users)
  //res.cookie('userId', users[random].id)
  var cookieID = users[random].id
  console.log(cookieID)
  res.cookie("userId", cookieID)
  res.redirect("/urls")

})

app.post("/urls", (req, res) => {
  console.log(req.body);
  var rando = generateRandomString()                          // KEY PART IS THAT CONSOLE.LOG ON TERMINALWHAT U SUBMIT. BUT IF U DONT
 urlDataBase[rando] = req.body.longURL
  console.log(urlDataBase)
  res.redirect(`/urls/${rando}`)
                                            // {longURL : WHAT U TYPED IN form }  // .longurl u get the value of it which is what
});                                                                   // u submit

app.post("/urls/:id/delete", (req,res) => {
  var id = req.params.id
  delete urlDataBase[id]
  res.redirect(`/urls`)
})

app.post("/urls/:id", (req, res) => {
   var id = req.params.id
   urlDataBase[id] = req.body.longURL
   res.redirect("/urls")

})

app.post("/login", (req, res) => {
console.log(req)
console.log(req.body.username)
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.status(302).redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}`)
})



