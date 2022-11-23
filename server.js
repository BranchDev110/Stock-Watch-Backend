const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = "db.sqlite";

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const createUser = (name) => {
  let id = null;
  db.run(`INSERT INTO USERS (name) VALUES (?)`, [name], function (err) {
    if (err) {
      return {state: "error", error: err.message};
    }
    id = this.lastID;
    db.run(
      `INSERT INTO WATCHLISTS (name, user_id) VALUES (?, ?)`,
      [`${name}'s Default Watch List`, this.lastID],
      function (err) {
        if (err) {
          return {state: "error", error: err.message};
        }
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["AAPL", this.lastID],
          function (err) {
            if (err) {
              return {state: "error", error: err.message};
            }
          }
        );
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["MSFT", this.lastID],
          function (err) {
            if (err) {
              return {state: "error", error: err.message};
            }
          }
        );
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["SPY", this.lastID],
          function (err) {
            if (err) {
              return {state: "error", error: err.message};
            }
          }
        );
      }
    );
  });
  return {state: "success", data: {id, name}}
};

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    // db.run(
    //   `CREATE TABLE USERS (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT, 
    //     name text
    //     )`,
    //   (err) => {
    //     console.log("1", err);
    //   }
    // );
    // db.run(
    //   `CREATE TABLE WATCHLISTS (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT, 
    //     user_id INTEGER,
    //     name text,
    //     FOREIGN KEY(user_id) REFERENCES USERS(id)
    //     )`,
    //   (err) => {
    //     console.log("2", err);
    //   }
    // );
    // db.run(
    //   `CREATE TABLE STOCKS (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     watchlist_id INTEGER,
    //     name text,
    //     FOREIGN KEY(watchlist_id) REFERENCES WATCHLISTS(id)
    //     )`,
    //   (err) => {
    //     console.log("3", err);
    //   }
    // );
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/api/user", function (req, res) {
  const sql = "SELECT * FROM USERS WHERE name = ?";
  const name = req.body.data;
  db.get(sql, name, async(err, row) => {
    if (err) {
      return res.status(400).json({ state: "error", error: err.message });
    }
    else {
      if (row) {
        return res.status(200).json({ state: "success", data: row});
      } else {
        const result = await createUser(name);
        if( result.state === "success" ) {
          return res.status(200).json(result);
        } else {
          return res.status(400).json(result);
        }
      }
    }
  });
});

app.post("/api/stock", function (req, res) {});

app.get("/api/stock", function (req, res) {});

app.post("api/watchlist", function (req, res) {});

app.get("api/watchlist", function (req, res) {});
