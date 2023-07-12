const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

const connectDB = require('./config/dbConnect');
const bookingRoutes = require('./routes/BookingRoute');

const app = express();
const port = 8080; 

app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/bookings', bookingRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, async() => {
await connectDB()
    console.log(`Server is running on port ${port}`);
});