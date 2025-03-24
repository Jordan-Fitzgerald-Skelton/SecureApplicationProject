const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(xssClean());
app.use(cors());

app.use('/', routes);
//start the server
app.listen(4000, () => console.log('Secure app running on port 4000'));
