import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VStack, Box, Button, Text, Spinner, Input, useToast, Icon } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { FaChair } from 'react-icons/fa';

function App() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatCount, setSeatCount] = useState('');
  const toast = useToast();
  const mainUrl = "https://ticket-reservation.onrender.com"

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${mainUrl}/bookings`);
      setSeats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const handleSeatBooking = async () => {
    if (seatCount > 7) {
      toast({
        title: 'Cannot book seats',
        description: 'Maximum 7 seats can be reserved at a time.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${mainUrl}/bookings`, { seatCount: parseInt(seatCount) });
      if (response.data.seatNumbers) {
        const bookedSeatNumbers = response.data.seatNumbers;
        const updatedSeats = seats.map((seat) =>
          bookedSeatNumbers.includes(seat.seatNumber) ? { ...seat, isBooked: true } : seat
        );
        setSeats(updatedSeats);

        toast({
          title: 'Seats booked successfully',
          description: `Booked seat numbers: ${bookedSeatNumbers.join(', ')}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Seats not available',
          description: 'All seats are already booked.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      setSeatCount('');
    } catch (error) {
      console.error('Error booking seats:', error);
    }
  };

  const handleClearSeats = async () => {
    try {
      await axios.post(`${mainUrl}/bookings/clear`);
      fetchSeats();
    } catch (error) {
      console.error('Error clearing seats:', error);
    }
  };

  const handleChangeSeatCount = (event) => {
    setSeatCount(event.target.value);
  };

  const renderSeats = () => {
    const seatRows = [];

    for (let i = 0; i < seats.length; i += 7) {
      const rowSeats = seats.slice(i, i + 7);

      const seatRow = (
        <Box key={i} display="flex" justifyContent="center" mb={2}>
          {rowSeats.map((seat) => (
            <Box
              key={seat.seatNumber}
              bg={seat.isBooked ? 'red.400' : 'green.400'}
              color="white"
              fontWeight="bold"
              p={2}
              borderRadius="md"
              width="50px"
              textAlign="center"
              mr={2}
              boxShadow={seat.isBooked ? 'md' : 'none'}
              position="relative"
            >
              {seat.isBooked && <FiCheck size={16} />}
              {seat.seatNumber}
            </Box>
          ))}
        </Box>
      );

      seatRows.push(seatRow);
    }

    return seatRows;
  };

  const countAvailableSeats = () => {
    const availableSeats = seats.filter((seat) => !seat.isBooked);
    return availableSeats.length;
  };

  const countBookedSeats = () => {
    const bookedSeats = seats.filter((seat) => seat.isBooked);
    return bookedSeats.length;
  };

  return (
    <Box display="flex" justifyContent="center" p={4} boxShadow="md" rounded="md">
      <VStack spacing={4} align="center"  width={{ base: '100%', md: '80%' }}>
        <Box display="flex" alignItems="center">
          <Icon as={FaChair} boxSize={6} color="teal.500" mr={2} />
          <Text fontSize="2xl" fontWeight="bold" color="teal.500">
            Seat Booking
          </Text>
        </Box>
        <Box position="absolute" top={4} left={4}>
          <Text fontSize="2xl" color="green.400"  fontWeight="bold">Available Seats: {countAvailableSeats()}</Text>
          <Text fontSize="2xl" color="red.400" fontWeight="bold">Booked Seats: {countBookedSeats()}</Text>
        </Box>

        <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} alignItems="center" gap={10}>
          <Box flex={1} display="flex" flexDirection="column" alignItems="center">
            <Input
              type="number"
              placeholder="Book your Seats!"
              value={seatCount}
              onChange={handleChangeSeatCount}
              mb={4}
            />

            <Box display="flex" gap={4}>
              <Button colorScheme="teal" onClick={handleSeatBooking} disabled={loading || seatCount === ''}>
                Book Seats
              </Button>

              <Button colorScheme="red" onClick={handleClearSeats} disabled={loading}>
                Clear Seats
              </Button>
            </Box>
          </Box>

          <Box flex={2} position="relative">
            {loading ? (
              <Spinner size="lg" />
            ) : (
              <Box>
                {renderSeats()}
              
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}

export default App;
