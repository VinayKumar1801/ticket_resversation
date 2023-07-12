const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// Get all seats with their status
router.get('/', async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        const bookedSeats = bookings[0].seatNumbers;
        const allSeats = [];

        for (let i = 1; i <= 80; i++) {
            allSeats.push({
                seatNumber: i,
                isBooked: bookedSeats.includes(i),
            });
        }

        res.json(allSeats);
    } catch (err) {
        next(err);
    }
});

// Create a new booking
router.post('/', async (req, res, next) => {
    const { seatCount } = req.body;
    if (seatCount > 7) {
        return res.status(400).json({ message: 'Invalid seat count. Maximum 7 seats can be reserved at a time.' });
    }

    try {
        const bookings = await Booking.find();
        const latestBooking = bookings[0];
        const bookedSeats = latestBooking.seatNumbers;

        let availableSeats = [];
        let row = 0;
        let tempRow = [];

        for (let i = 1; i <= 80; i++) {
            if (!bookedSeats.includes(i)) {
                tempRow.push(i);

                if (tempRow.length === 7) {
                    availableSeats.push(tempRow);
                    tempRow = [];
                }
            }
        }

        let bookedSeatNumbers = [];
        let rowWithEnoughSeats = -1;

        // Check if seats are available in one row
        for (let i = 0; i < availableSeats.length; i++) {
            if (availableSeats[i].length >= seatCount) {
                rowWithEnoughSeats = i;
                bookedSeatNumbers = availableSeats[i].slice(0, seatCount);
                break;
            }
        }

        if (rowWithEnoughSeats !== -1) {
            // Book seats in one row
            const newBookedSeats = [...bookedSeats, ...bookedSeatNumbers];
            latestBooking.seatNumbers = newBookedSeats;
            await latestBooking.save();

            res.json({ message: 'Booking successful!', seatNumbers: bookedSeatNumbers });
        } else {
            // Book nearby seats
            let remainingSeats = seatCount;
            let i = 0;

            while (remainingSeats > 0 && i < availableSeats.length) {
                const availableRow = availableSeats[i];
                const availableSeatsCount = availableRow.length;

                if (availableSeatsCount >= remainingSeats) {
                    const seatsToBook = availableRow.slice(0, remainingSeats);
                    bookedSeatNumbers = [...bookedSeatNumbers, ...seatsToBook];
                    remainingSeats -= seatsToBook.length;
                } else {
                    bookedSeatNumbers = [...bookedSeatNumbers, ...availableRow];
                    remainingSeats -= availableSeatsCount;
                }

                i++;
            }

            if (remainingSeats === 0) {
                // Booked seats successfully
                const newBookedSeats = [...bookedSeats, ...bookedSeatNumbers];
                latestBooking.seatNumbers = newBookedSeats;
                await latestBooking.save();

                res.json({ message: 'Booking successful!', seatNumbers: bookedSeatNumbers });
            } else {
                res.json({ message: 'Seats not available' });
            }
        }
    } catch (err) {
        next(err);
    }
});

router.post('/clear', async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        const latestBooking = bookings[0];
        latestBooking.seatNumbers = [];
        await latestBooking.save();

        res.json({ message: 'All seats cleared.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
