const express = require("express");
const app = express();
const port = 3000;


// built ini middleware (m: fungsi running di tengah req-res)
app.use(express.json()); //parse JSON (p: read and edit format data to be understandable by js)
app.use(express.urlencoded({ extended: true })); //parse form data
app.use(express.static("public")); //serve static files
app.set('view engine', 'ejs');

//static routes
app.get('/', (request, response) => {
  response.send(`
   <html>
   <head>
    <link rel="stylesheet" href ="style.css">
   </head>
   <body>
    <div class="container">
     <h1>My express app</h1>
     <p> This page uses CSS and JavaScript!</p>
    </div>
   </body>
   </html>
   `);
});

app.get("/about", (request, response) => {
  response.send("<h2>About page</h2><p>This is express!</p>");
});

//(2) show a simple form
app.get('/test-form', (req, res) => {
  res.send(`
    <h2>TEST FORM</h2>
    <form method="POST" action="/test-form">
      <input type="text" name="username" placeholder="Enter your name" required>
      <button type="submit">SUBMIT</button>
    </form>
    `);
});

//(2) feedback form
app.get("/feedback", (req, res) => {
  res.send(`
   <h2> FEEDBACK FORM</h2>
   <form method="POST" action="/feedback">
    <input type="text" name="username" placeholder="Enter your name" required>
    <input type="email" name="email" placeholder="Your email" required>
    <input type ="text" name="comments" placeholder="Comments (optional)">
     <select name= "rating" id ="rating" placeholder="rating">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
    <button type="submit">SUBMIT</button>
   </form>
  `);
});

//(2) handle test-form submission 
app.post('/test-form', (req, res) => {
  const username = req.body.username;
  res.send(`<h2>Hello ${username}!</h2>`);
});

// (2) handle feedback form submission
app.post("/feedback", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const rating = req.body.rating;

  res.send(`
   <h2>Hello ${username}!</h2> <h3>Thanks for your feedback!</h3>
   <p>Email : ${email}</p>
   <p>Rating : You rate ${rating} stars</p>
   `);
});

// (3) PASSWORD GENERATOR FUNCTION
function generatePassword(
  length = 12,
  includeSymbols = true,
  includeNumbers = true,
) {
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeNumbers) chars += "0123456789";
  if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<div>?";

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Show password generator form
app.get("/password", (req, res) => {
  res.render('password');
});

// Generate password
app.post('/password', (req, res) => {
  const length = parseInt(req.body.length) || 12;
  const includeSymbols = req.body.symbols === 'on';
  const includeNumbers = req.body.numbers === 'on';

  const password = generatePassword(length, includeSymbols, includeNumbers);

  res.render('password', {
    generatedPassword: password,
    length: length,
    includeSymbols: includeSymbols,
    includeNumbers: includeNumbers,
    showResult: true
  });
});


//route with params
app.get("/user/:name", (request, response) => {
  const userName = request.params.name;
  response.send(`<h2>Hello ${userName}!</h2>`);
});

//multiple params
app.get("/user/:name/age/:age", (request, response) => {
  const { name, age } = request.params;
  response.send(`<h2>Hello ${name}, you are ${age} years old!</h2>`);
});

//route(after ejs)
app.get('/', (req, res) => {
  res.render('home', {
    username: 'Developer',
    currentDate: new addEventListener().toLocaleDateString()
  });
});

//custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); //IMPORTANT : call next() to continue!
});

app.listen(port, () => {
  console.log(`express server running on port ${port}`);
});
