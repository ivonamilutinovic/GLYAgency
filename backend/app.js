var createError = require("http-errors");
var express = require("express");
var path = require("path");
const cors = require("cors");
const forceSsl = require("express-force-ssl");
const queryString = require('query-string');
var sockIO = require('socket.io')();

var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
fs = require("fs")

var passport = require("passport");

const app = express();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var offerRouter = require("./routes/real-estate-offers");
var realEstateList = require("./routes/real-estate-list");
const addRealEstate = require("./routes/add-real-estate");
const advertisement = require("./routes/advertisement");
const favorites = require("./routes/favorites")
var config = require("./config");


const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose.set('useFindAndModify', false);
const hostname = "localhost";


const corsOptions = {
  origin: "https://" + hostname,
  successStatus: 200,
};

// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoIndex: true
});

connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);


//app.use('/', require('./routes/index')(app.io));
app.options("*", cors());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.enable('etag');

//middleware function for CORS setup
app.use(function (_, res, next) {
  //res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Auth-Token, Authorization, X-Requested-With"
  );
  next();
});

/* io.on('error', function () {
  console.log("errr");
}); */

// automatically redirect all http requests to https
//app.use(forceSsl);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.secretKey));
app.use(express.static(path.join(__dirname, "public")));
app.use('/static/public', express.static(path.join(__dirname, 'real-estates')));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/offer", offerRouter);
app.use("/real-estate-list", realEstateList);
app.use("/add-real-estate", addRealEstate)
app.use("/advertisement", advertisement)
app.use("/favorites", favorites)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
