const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

// Configure CORS
const corsOptions = {
  origin: 'https://ChrisSnowden.com',  // Only allow this domain
  optionsSuccessStatus: 200  // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Register the routes
app.use('/api/inquiries', inquiryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
