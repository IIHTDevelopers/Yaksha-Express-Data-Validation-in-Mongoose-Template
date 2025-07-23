const request = require('supertest');
const app = require('../../app'); // Import the main Express app
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Hotel = require('../../models/hotel');  // Import the Hotel model

let mongoServer;

// Start MongoDB in-memory server before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Close MongoDB connection and stop in-memory server after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

let hotelRoutesBoundaryTest = `HotelRoutes boundary test`;

describe('Hotel Routes', () => {
  describe('boundary', () => {
    let hotelId;

    // Setup: Create a hotel for testing
    beforeEach(async () => {
      const hotel = new Hotel({
        name: 'Hotel California',
        location: 'California',
        price: 200,
        rooms: 100
      });
      const savedHotel = await hotel.save();
      hotelId = savedHotel._id;
    });

    // Clean up after each test
    afterEach(async () => {
      await Hotel.deleteMany();
    });

    // Test case 1: POST Create a new hotel
    test(`${hotelRoutesBoundaryTest} should create a new hotel`, async () => {
      const newHotel = {
        name: 'Mountain Resort',
        location: 'Colorado',
        price: 300,
        rooms: 50
      };

      const response = await request(app)
        .post('/api/hotels')
        .send(newHotel)
        .expect(201);

      // Assertions
      expect(response.body.message).toBe('Hotel successfully added!');
      expect(response.body.hotel.name).toBe(newHotel.name);
      expect(response.body.hotel.location).toBe(newHotel.location);
      expect(response.body.hotel.price).toBe(newHotel.price);
      expect(response.body.hotel.rooms).toBe(newHotel.rooms);
    });

    // Test case 2: GET Retrieve all hotels
    test(`${hotelRoutesBoundaryTest} should retrieve all hotels`, async () => {
      const response = await request(app)
        .get('/api/hotels')
        .expect(200);

      // Assertions
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);  // At least one hotel should be there
    });

    // Test case 3: GET Retrieve a single hotel by ID
    test(`${hotelRoutesBoundaryTest} should retrieve a single hotel by ID`, async () => {
      const response = await request(app)
        .get(`/api/hotels/${hotelId}`)
        .expect(200);

      // Assertions
      expect(response.body._id).toBe(hotelId.toString());
      expect(response.body.name).toBe('Hotel California');
      expect(response.body.location).toBe('California');
      expect(response.body.price).toBe(200);
      expect(response.body.rooms).toBe(100);
    });

    // Test case 4: GET should return 404 if hotel not found
    test(`${hotelRoutesBoundaryTest} should return 404 if hotel not found`, async () => {
      const nonExistingHotelId = mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/hotels/${nonExistingHotelId}`)
        .expect(404);

      // Assertions
      expect(response.body.message).toBe('Hotel not found');
    });

    // Test case 5: DELETE Delete a hotel by ID
    test(`${hotelRoutesBoundaryTest} should delete a hotel by ID`, async () => {
      const response = await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .expect(200);

      // Assertions
      expect(response.body.message).toBe('Hotel deleted successfully');
    });

    // Test case 6: DELETE should return 404 if hotel not found
    test(`${hotelRoutesBoundaryTest} should return 404 if hotel to delete not found`, async () => {
      const nonExistingHotelId = mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/hotels/${nonExistingHotelId}`)
        .expect(404);

      // Assertions
      expect(response.body.message).toBe('Hotel not found');
    });
  });
});

