// Shared test environment (loaded first by each unit test)
process.env.JWT_SECRET = 'test_secret_test_secret_test_secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';
