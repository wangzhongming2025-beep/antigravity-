export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Method not allowed' } });
    }

    // 1. Security Check (Access Code)
    // Simple protection for the training camp
    const accessCode = req.headers['x-access-code'];
    const CORRECT_CODE = process.env.ACCESS_CODE || 'vip888'; // Default code

    if (accessCode !== CORRECT_CODE) {
        return res.status(401).json({ error: { message: '访问密码错误 (Invalid Access Code)' } });
    }

    // 2. Get API Key from Server Environment (Fallback to provided key)
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-5d4859e308834219aaf323cfafcfa75f';
    if (!apiKey) {
        return res.status(500).json({ error: { message: 'Server Configuration Error: API Key not set.' } });
    }

    const { messages } = req.body;

    try {
        // 3. Call DeepSeek API (Server to Server)
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            // Forward the specific error (e.g. balance)
            return res.status(response.status).json({ error: { message: err.error?.message || 'DeepSeek API Error' } });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
