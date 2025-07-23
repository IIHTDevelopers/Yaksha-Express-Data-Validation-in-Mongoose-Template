const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Hotel = require('../../models/hotel');  // Import the Hotel model

let mongoServer;

// Start an in-memory MongoDB server before tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Close the in-memory MongoDB server after tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let hotelModelBoundaryTest = `HotelModel boundary test`;

describe('Hotel Model', () => {
    describe('boundary', () => {

        // Test case 1: Valid Hotel Creation
        test(`${hotelModelBoundaryTest} should create a hotel with valid data`, async () => {
            const validHotel = {
                name: 'Hotel California',
                location: 'California',
                price: 200,
                rooms: 100
            };

            const hotel = new Hotel(validHotel);
            await hotel.save();

            // Assertions
            expect(hotel).toHaveProperty('_id');
            expect(hotel.name).toBe('Hotel California');
            expect(hotel.location).toBe('California');
            expect(hotel.price).toBe(200);
            expect(hotel.rooms).toBe(100);
        });

        // Test case 3: Price Validation (Less than $50)
        test(`${hotelModelBoundaryTest} should throw an error if price is less than $50`, async () => {
            const invalidHotel = new Hotel({
                name: 'Budget Stay',
                location: 'New York',
                price: 30,  // Invalid price less than $50
                rooms: 50
            });

            let error;
            try {
                await invalidHotel.save();
            } catch (err) {
                error = err;
            }

            // Assertions
            expect(error).toBeDefined();
            expect(error.errors.price.message).toBe('Price must be at least $50');
        });

        // Test case 4: Missing Required Fields
        test(`${hotelModelBoundaryTest} should throw an error if required fields are missing`, async () => {
            const invalidHotel = new Hotel({
                location: 'New York',
                price: 200,  // Missing `name` and `rooms`
            });

            let error;
            try {
                await invalidHotel.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Missing required fields should trigger validation errors
            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.rooms).toBeDefined();
        });

        // Test case 5: Room Validation (Less than 1 Room)
        test(`${hotelModelBoundaryTest} should throw an error if number of rooms is less than 1`, async () => {
            const invalidHotel = new Hotel({
                name: 'Tiny Hotel',
                location: 'Paris',
                price: 100,
                rooms: 0  // Invalid number of rooms
            });

            let error;
            try {
                await invalidHotel.save();
            } catch (err) {
                error = err;
            }

            // Assertions
            expect(error).toBeDefined();
            expect(error.errors.rooms.message).toBe('There must be at least one room');
        });

        // Test case 6: Valid Hotel Creation with Timestamps
        test(`${hotelModelBoundaryTest} should create a hotel and include timestamps`, async () => {
            const hotelData = {
                name: 'Grand Hotel',
                location: 'London',
                price: 350,
                rooms: 200
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            // Assertions: Ensure createdAt and updatedAt are automatically added
            expect(hotel.createdAt).toBeDefined();
            expect(hotel.updatedAt).toBeDefined();
        });
    });
});

