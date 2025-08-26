const express = require("express");
const app = express();
// const port = 3000;
const port = process.env.PORT || 3000;
const fs = require("fs").promises; //use promise version for cleaner code
const path = require("path");
// built ini middleware (m: fungsi running di tengah req-res)
app.use(express.json()); //parse JSON (p: read and edit format data to be understandable by js)
app.use(express.urlencoded({ extended: true })); //parse form data
app.use(express.static("public")); //serve static files
app.set("view engine", "ejs");//set view engine to ejs
app.set("views", path.join(__dirname, "views")); //set views directory

// file path for storing password history
const historyFile = path.join(__dirname, "password_history.json");

//function to read password history
async function readPasswordHistory() {
  try {
    const data = await fs.readFile(historyFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    return [];
  }
}

//function to save password history
async function savePasswordToHistory(passwordData) {
  try {
    const history = await readPasswordHistory();
    history.unshift(passwordData); //add newest password to beginning of array

    //keep only last 50 passwords
    if (history.length > 50) {
      history.splice(50);
    }
    //write updated history back to file
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error saving password history:", error);
  }
}

//password validation middleware
function validatePasswordRequest(req, res, next) {
  const { length, symbols, numbers} = req.body;
  const errors = [];

  //validate length
  const parsedLength = parseInt(length);
  if (!parsedLength || parsedLength < 4 || parsedLength > 50) {
    errors.push('Length must be between 4 and 50 characters');
  }

  //validate at least one charaacter type
  const hasSymbols = symbols === 'on';
  const hasNumbers = numbers === 'on';
  if (!hasNumbers) {
    errors.push('Must include at least numbers or symbols')
  }
if (errors.length > 0) {
  return res.render('password', {
    errors: errors,
    length: length,
    includeSymbols: hasSymbols,
    includeNumbers: hasNumbers
  });
}

  next();
}

//static routes
app.get("/", (request, response) => {
   response.render('home', {
   username: 'Developer',
   currentDate: new Date().toLocaleDateString('id-ID')
   })
  });

app.get("/about", (request, response) => {
  response.send("<h2>About page</h2><p>This is express!</p>");
});

//(2) show a simple form
app.get("/test-form", (req, res) => {
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
app.post("/test-form", (req, res) => {
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
  includeNumbers = true
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


app.get("/history", async (req, res, next) => {
  try {
    const history = await readPasswordHistory();
    const passwords = (Array.isArray(history) ? history : []).map((item) => ({
      password: item.password ?? String(item),
      length: item.password ?? String(item),
      includeSymbols: !!item.includeSymbols,
      includeNumbers: !!item.includeNumbers,
      timestamp: item.timestamp || item.createdAt || Date.now(),
    }));
    // console.log("password mapped ->", password.length);

    // return res.type("json").send(passwords);

    res.render("history", { passwords });
  } catch (e) {
    next(e);
  }
});

// Generate password
app.post("/password", validatePasswordRequest, async (req, res) => {
  const length = parseInt(req.body.length) || 12;
  const includeSymbols = req.body.symbols === "on";
  const includeNumbers = req.body.numbers === "on";

  const password = generatePassword(length, includeSymbols, includeNumbers);


//save password to history
await savePasswordToHistory({
  password: password,
  length: length,
  includeSymbols: includeSymbols,
  includeNumbers: includeNumbers,
  timestamp: new Date().toISOString(),
});

res.render("password", {
  generatedPassword: password,
  length: length,
  includeSymbols: includeSymbols,
  includeNumbers: includeNumbers,
  showResult: true,
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
app.get("/", (req, res) => {
  res.render("home", {
    username: "Developer",
    currentDate: new addEventListener().toLocaleDateString(),
  });
});

// Show password generator form
app.get('/password', (req, res) => {
  res.render("password");
});


//custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); //IMPORTANT : call next() to continue!
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//404 handler
app.use('/', (req, res) => {
  res.status(404).render('error', {
    error: 'page not found!',
    code: 404
  });
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .type("html")
    .send(`<h2>Server Error</h2><pre>${err.stack}</pre>`);
});

