const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const convertRoute = require('../routes/convert');
const determineLanguage = require('../routes/convert');
const analyzeCode = require('../routes/convert');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/', convertRoute); // Add this line

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
