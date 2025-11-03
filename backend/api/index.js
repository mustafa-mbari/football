// Vercel serverless function entry point
try {
  const compiled = require('../dist/index.js');
  const app = compiled.default || compiled;
  module.exports = app;
} catch (error) {
  console.error('Failed to load Express app:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      stack: error.stack
    });
  };
}
