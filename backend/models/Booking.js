const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    seatNumbers: {
        type: [Number],
        required: true,
    },
});

module.exports = mongoose.model('Booking', bookingSchema);
