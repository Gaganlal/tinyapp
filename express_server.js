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
  "b2xVn2": {
   longURL : "http://www.lighthouselabs.ca",
   userID : "userRandomID"
 },
 "9sm5xK": {
  longURL: "http://www.google.com",
  userID : "userRandomID"
 }
};


function findURLS(userid) {
  var filterDatabase = []
  for (var shortkey in urlDataBase) {
    if(userid === urlDataBase[shortkey].userId) {
      let data = urlDataBase[shortkey];
      data['shortURL']= shortkey
      filterDatabase.push(data)
      console.log(filterDatabase)
    }
  }
  return filterDatabase;
}

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
    if(req.cookies.userId === undefined ){
      res.send("Please Log in")
    } else {
      let filterData = findURLS(req.cookies.userId)

  console.log(filterData)
  let templateVars = {
    filterDatabase: filterData,
    userId: users[req.cookies.userId]
   };                         //passing the urls data (urlDataBase) to the template urls_index
  res.render("urls_index", templateVars);
  }                                 //by storing as variable templateVars
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL : req.params.id,
    longURL : urlDataBase,
    userId: users[req.cookies.userId]
  }
  var shortURL = req.params.id
  console.log("shortURL:", shortURL)
  console.log("ActualUrlDataBase :", urlDataBase )
  console.log("req.cookies :", req.cookies)
  console.log("urlDataBase: ", urlDataBase[shortURL])

  if(req.cookies.userId === urlDataBase[shortURL].userId) {
    res.render('urls_show', templateVars)
  } else {
    res.send("you don't have permission to edit")
  }
})

app.get("/urls/new", (req,res) => {
if(!req.cookies['userId']) {
  res.redirect("/urls")
}
let templateVars = {
    urls: urlDataBase,
    userId: users[req.cookies.userId]
   };
   res.render("urls_new", templateVars)

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
    return res.status(400).send("fill in fool")         // the reutn key prevents the sending headers error
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
  var rando = generateRandomString()
  const longURL = req.body.longURL
  const userID = req.cookies.userId                  // KEY PART IS THAT CONSOLE.LOG ON TERMINALWHAT U SUBMIT. BUT IF U DONT
 urlDataBase[rando] = {
  longURL: longURL,
  userID: req.cookies.userId
}
  console.log(urlDataBase)
  res.redirect(`/urls/${rando}`)
                                            // {longURL : WHAT U TYPED IN form }  // .longurl u get the value of it which is what
});                                                                   // u submit

app.post("/urls/:id/delete", (req,res) => {
  var shortURL = req.params.id;
  if (req.cookies.userId === urlDataBase[shortURL].userID) {
    delete urlDataBase[shortURL]
     res.redirect(`/urls`)
  } else {
    res.send("fam you don't have permission to delete me!")
  }
})

app.post("/urls/:id", (req, res) => {
   var id = req.params.id
   urlDataBase[id] = req.body.longURL
   res.redirect("/urls")

})

app.get('/login', (req, res) => {
  res.render('loginpage')
})
app.post("/login", (req, res) => {
  const names = req.body.names
  const email = req.body.email
  const password = req.body.password
  console.log(req.body)
  for (key in users) {
    if (email === users[key].email && password === users[key].password) {
      res.cookie('userId', key)
      res.redirect('/urls')
    }
  } if (email !== users[key].email && password !== users[key].password) {
    return res.status(403).send("Incorrect Email or Password")
  }
// var entirebody = req.body
// console.log(entirebody)

})

app.post("/logout", (req, res) => {
  res.clearCookie('userId')
  res.status(302).redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}`)
})



