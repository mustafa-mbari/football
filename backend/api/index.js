// Vercel serverless function entry point
const path = require('path');

try {
  // Try different possible paths for the compiled app
  const possiblePaths = [
    path.join(__dirname, '../dist/index.js'),
    path.join(__dirname, '../../dist/index.js'),
    path.join(process.cwd(), 'dist/index.js'),
    path.join(process.cwd(), 'backend/dist/index.js')
  ];

  let app = null;
  let lastError = null;

  for (const tryPath of possiblePaths) {
    try {
      const compiled = require(tryPath);
      app = compiled.default || compiled;
      console.log('Successfully loaded app from:', tryPath);
      break;
    } catch (err) {
      lastError = err;
      console.log('Failed to load from:', tryPath, err.message);
    }
  }

  if (!app) {
    throw lastError || new Error('Could not find compiled app in any location');
  }

  module.exports = app;
} catch (error) {
  console.error('Failed to load Express app:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      stack: error.stack,
      cwd: process.cwd(),
      dirname: __dirname
    });
  };
}
