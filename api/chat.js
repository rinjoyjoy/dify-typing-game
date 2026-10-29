export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, conversation_id } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message is too long' });
  }
  if (conversation_id !== undefined && conversation_id !== null && conversation_id !== '' &&
      (typeof conversation_id !== 'string' || !/^[0-9a-zA-Z-]{1,64}$/.test(conversation_id))) {
    return res.status(400).json({ error: 'Invalid conversation_id' });
  }

  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages';

  if (!DIFY_API_KEY) {
    return res.status(500).json({ error: 'DIFY_API_KEY is not configured.' });
  }

  try {
    const requestBody = {
      inputs: {}, // プロンプトやシステム指示はDify側の管理画面で設定してください
      query: message,
      response_mode: "blocking",
      user: "typing-game-user"
    };
    if (conversation_id) {
      requestBody.conversation_id = conversation_id;
    }

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('Dify API error:', response.status, await response.text());
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('chat handler error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
