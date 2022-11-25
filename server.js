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

const createUser = (res, name) => {
  let id = null;
  db.run(`INSERT INTO USERS (name) VALUES (?)`, [name], function (err) {
    if (err) {
      return res.status(400).json({state: "error", error: err.message});
    }
    id = this.lastID;
    db.run(
      `INSERT INTO WATCHLISTS (name, user_id) VALUES (?, ?)`,
      [`${name}'s Default Watch List`, this.lastID],
      function (err) {
        if (err) {
          return res.status(400).json({state: "error", error: err.message});
        }
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["AAPL", this.lastID],
          function (err) {
            if (err) {
              return res.status(400).json({state: "error", error: err.message});
            }
          }
        );
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["MSFT", this.lastID],
          function (err) {
            if (err) {
              return res.status(400).json({state: "error", error: err.message});
            }
          }
        );
        db.run(
          `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
          ["SPY", this.lastID],
          function (err) {
            if (err) {
              return res.status(400).json({state: "error", error: err.message});
            }
          }
        );
      }
    );
    return res.status(200).json({state: "success", data: {id, name}})
  });
};

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE USERS (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name text
        )`,
      (err) => {
        console.log("1", err);
      }
    );
    db.run(
      `CREATE TABLE WATCHLISTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER,
        name text,
        FOREIGN KEY(user_id) REFERENCES USERS(id)
        )`,
      (err) => {
        console.log("2", err);
      }
    );
    db.run(
      `CREATE TABLE STOCKS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        watchlist_id INTEGER,
        name text,
        FOREIGN KEY(watchlist_id) REFERENCES WATCHLISTS(id)
        )`,
      (err) => {
        console.log("3", err);
      }
    );
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
        createUser(res, name);
      }
    }
  });
});

app.post("/api/watchlist", function (req, res) {
  const {userid, name} = req.body.data;
  db.run(
    `INSERT INTO WATCHLISTS (name, user_id) VALUES (?, ?)`,
    [name, userid],
    function (err){
      if( err ){
        return res.status(400).json({state: "error", error: err.message})
      }
      return res.status(200).json({state: "success", data: {id: this.lastID, user_id: userid, name: name}})
    }
  );
});

app.get("/api/watchlist/:id", function (req, res) {
  const id = req.params.id;
  const sql = "SELECT * FROM WATCHLISTS WHERE user_id = ?";
  db.all(sql, [id], async(err, rows) => {
    if (err) {
      return res.status(400).json({ state: "error", error: err.message });
    }
    else {
      return res.status(200).json({ state: "success", data: rows });
    }
  });
});

app.patch("/api/watchlist/:id", function (req, res) {
  const listname = req.body.data;
  const listid = req.params.id;
  db.run(
    `UPDATE WATCHLISTS SET name = COALESCE(?, name) WHERE id = ?`,
    [listname, listid],
    function (err){
      if( err ){
        return res.status(400).json({state: "error", error: err.message})
      }
      return res.status(200).json({state: "success", data: {id: listid, name: listname}})
    }
  );
});

app.delete("/api/watchlist/:id", function (req, res) {
  const listid = req.params.id;
  db.run(`DELETE FROM WATCHLISTS WHERE id = ?`, listid, function(err, result) {
    if( err ){
      return res.status(400).json({state: "error", error: err.message})
    }
    return res.json({state: "success"});
  })
})

app.get("/api/stock/:id", function (req, res) {
  const listid = req.params.id;
  console.log(listid);
  const sql = "SELECT * FROM STOCKS WHERE watchlist_id = ?";
  db.all(sql, [listid], async(err, rows) => {
    if (err) {
      return res.status(400).json({ state: "error", error: err.message });
    }
    else {
      console.log(rows);
      return res.status(200).json({ state: "success", data: rows });
    }
  });
})

app.post("/api/stock", function (req, res) {
  console.log(req.body);
  const {listid, symbol} = req.body.data;
  console.log(listid, symbol);
  db.run(
    `INSERT INTO STOCKS (name, watchlist_id) VALUES (?, ?)`,
    [symbol, listid],
    function (err) {
      if (err) {
        return res.status(400).json({ state: "error", error: err.message });
      }
      return res.status(200).json({ state: "success" , data: {id: this.lastID, watchlist_id: listid, name: symbol}});
    }
  );
})

app.delete('/api/stock/:id', function (req, res) {
  const stockid = req.params.id;
  db.run(`DELETE FROM STOCKS WHERE id = ?`, stockid, function(err, result) {
    if( err ){
      return res.status(400).json({state: "error", error: err.message})
    }
    return res.json({state: "success"});
  })
})