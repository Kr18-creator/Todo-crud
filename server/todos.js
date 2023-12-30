const express = require("express");
const router = express.Router();
const db = require("./db");

//create a todo

router.post("/todos", (req, res) => {
  try {
    const todo = req.body;
    const sql = "INSERT INTO todo (description) VALUES (?)";

    db.query(sql, [todo.description], (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          // Duplicate entry error
          return res.status(400).json({ error: "Duplicate key for todo id" });
        }

        console.error(error);
        return res.status(500).send("Server error");
      }
      // console.log("#################################", result);

      const insertedTodo = {
        id: result.insertId,
        description: todo.description,
      };

      res.status(201).json(insertedTodo);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//get all todos

router.get("/todos", (req, res) => {
  try {
    const sql = "SELECT * FROM todo";

    db.query(sql, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send("Server error");
      } else {
        res.json(results);
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//get a todo by id

router.get("/todos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM todo WHERE todo_id = ?";
    db.query(sql, [id], (error, result) => {
      // console.log("#################################", result);
      if (error) {
        console.error(error);
        res.status(500).send("Server error");
      } else {
        res.status(200).json(result[0]);
      }
    });
  } catch (err) {
    console.error(err.message);
  }
});

// Update a todo
router.put("/todos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateQuery = "UPDATE todo SET description = ? WHERE todo_id = ?";
    const selectQuery = "SELECT * FROM todo WHERE todo_id = ?";

    // Using await to ensure the update completes before sending a response
    db.query(updateQuery, [description, id], async (error) => {
      if (error) {
        console.error(error);
        res.status(500).send("Server error");
      } else {
        // Execute a SELECT query to get the updated todo
        db.query(selectQuery, [id], (selectError, selectResult) => {
          if (selectError) {
            console.error(selectError);
            res.status(500).send("Server error");
          } else {
            const updatedTodo = selectResult[0];
            res.status(200).json(updatedTodo);
          }
        });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a todo
router.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const getDeletedTodoQuery = "SELECT * FROM todo WHERE todo_id = ?";
    const deleteTodoQuery = "DELETE FROM todo WHERE todo_id = ?";

    // Using await to ensure the delete completes before sending a response
    const [deletedTodo] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(getDeletedTodoQuery, [id], (error, result) => {
          // console.log("1111111111111111111111", result);
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve(result[0]);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.query(deleteTodoQuery, [id], (error, result) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve(result);
          }
        });
      }),
    ]);

    if (deletedTodo) {
      res.status(200).json({ message: "Todo was deleted!", deletedTodo });
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
