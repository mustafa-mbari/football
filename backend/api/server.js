// Simple test endpoint to verify Vercel is working
module.exports = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Vercel serverless function is working!',
    path: req.url,
    method: req.method,
    cwd: process.cwd(),
    dirname: __dirname,
    env: {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV
    }
  });
};
