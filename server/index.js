const express = require("express");
const usersRouter = require("./todos");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
