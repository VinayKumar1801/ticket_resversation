const mongoose = require('mongoose');
const Booking = require('../models/Booking'); 
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://seats:seats123@cluster0.5nod2qe.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        const bookings = await Booking.find();
        if (bookings.length === 0) {
            const allSeats = [];
            for (let i = 1; i <= 80; i++) {
                allSeats.push(i);
            }
            const initialBooking = new Booking({ seatNumbers: allSeats });
            await initialBooking.save();
            console.log('Initialized the database with all seats available.');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
};

module.exports = connectDB;
