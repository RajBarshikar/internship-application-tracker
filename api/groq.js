const { proxyGroqChat, readGroqKey } = require('../lib/groq');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const result = await proxyGroqChat(req.body, readGroqKey());
    res.status(result.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(result.body);
  } catch (err) {
    res.status(502).json({ error: 'Groq request failed' });
  }
};
