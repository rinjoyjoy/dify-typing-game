export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, conversation_id } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
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
      conversation_id: conversation_id || "",
      user: "typing-game-user"
    };

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Dify API error: ${errText}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
