//Import libraries
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const isValidUrl = require("./utils/isValidUrl");
const fs = require("fs");
const short = require("short-uuid");
const mongoose = require("mongoose");
const Url = require("./models/url");
const password = require("./secret");

//Connect to the database
const databaseURL = `mongodb+srv://ste:${password}@cluster0.wqaov.mongodb.net/URL?retryWrites=true&w=majority`;
mongoose.connect(databaseURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Read the messages
const messages = JSON.parse(fs.readFileSync("./utils/messages.json"));

//Create the application
const app = express();

//Set the views
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

//Middlewares
app.use(express.static(path.resolve(__dirname, "images")));
app.use(express.static(path.resolve(__dirname, "scripts")));
app.use(express.static(path.resolve(__dirname, "styles")));
app.use(express.static(path.resolve(__dirname, "static")));
app.use(logger("short"));
app.use(bodyParser.urlencoded({ extended: false }));

/*let success = '';
let error = '';
app.locals.success = success;
app.locals.error = error;*/

//GET home page
app.get("/", (req, res) => {
  Url.find({})
    .sort({ createdAt: -1 })
    .exec((err, urls) => {
      if (err) {
        console.log(err);
      }

      if (urls) {
        res.render("index", { error: "", success: "", urls });
      }
    });
});

app.post("/", (req, res) => {
  const longUrl = req.body.url;
  if (isValidUrl(longUrl)) {
    //Check if the URL is already present
    Url.findOne({ long: longUrl }, (err, url) => {
      if (err) {
        console.log(err);
      }

      if (url) {
        Url.find({})
          .sort({ createdAt: -1 })
          .exec((err, urls) => {
            if (err) {
              console.log(err);
            }

            if (urls) {
              res.render("index", {
                error: messages["ALREADY PRESENT URL"],
                success: "",
                urls,
              });
            }
          });
      } else {
        const newUrl = new Url({ long: longUrl, short: short.generate() });

        newUrl.save((err) => {
          if (err) {
            console.log(err);
          } else {
            Url.find({})
              .sort({ createdAt: -1 })
              .exec((err, urls) => {
                if (err) {
                  console.log(err);
                }

                if (urls) {
                  res.render("index", {
                    error: "",
                    success: messages["SUCCESS"],
                    urls,
                  });
                }
              });
          }
        });
      }
    });
  } else {
    Url.find({})
      .sort({ createdAt: -1 })
      .exec((err, urls) => {
        if (err) {
          console.log(err);
        }

        if (urls) {
          res.render("index", {
            error: messages["INVALID URL"],
            success: "",
            urls,
          });
        }
      });
  }
});

app.get("/:short", (req, res, next) => {
  Url.findOneAndUpdate(
    { short: req.params.short },
    { $inc: { visits: 1 } },
    (err, url) => {
      if (err) {
        console.log(err);
      }

      if (url) {
        res.status(301).redirect(url.long);
      } else {
        next();
      }
    }
  );
});

app.use((req, res) => {
  res.render("404");
});

//Set the port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
