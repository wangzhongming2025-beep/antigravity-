export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, content } = req.body;
    if (!type) {
        return res.status(400).json({ error: 'Invalid request: missing type' });
    }

    // API Configuration
    const api_key = 'sk-28380a97b217485992b353c4371ce70a';
    const api_url = 'https://api.deepseek.com/v1/chat/completions';

    let system_prompt = "You are a neuroscience expert and performance coach specializing in ADHD and executive function (based on Huberman and Barkley). Your goal is to provide concise, scientifically-grounded, and highly motivating feedback for a 'NeuroFlow' dashboard.";
    let user_prompt = "";

    if (type === 'identity') {
        system_prompt += " Create a powerful, 1-sentence 'Identity Statement' (身份宣言) in Chinese. Start with '我是'. Also assess the sentiment stress level on a scale of 0 to 20 (0 = zen, 20 = high anxiety). Return JSON format: {\"content\": \"...\", \"stress_impact\": number}";
        user_prompt = `Current state: ${content || "正常"}. Generate statement and stress score.`;
    } else if (type === 'task') {
        system_prompt += " You are a 'Dopamine Slicer'. Return JSON format: {\"content\": \"...\", \"estimated_minutes\": number}";
        user_prompt = `Task to deconstruct: ${content}`;
    } else if (type === 'detox') {
        system_prompt += " You are a 'Receptor Reset' specialist. Return JSON format: {\"content\": \"...\"}";
        user_prompt = `Habits to reset: ${content}`;
    } else if (type === 'recall_eval') {
        system_prompt += " Rate accuracy out of 100 in format [Score]. Return JSON format: {\"score\": number, \"feedback\": \"...\"}";
        user_prompt = `Original: ${req.body.original}\nRecall: ${req.body.recall}`;
    } else {
        return res.status(400).json({ error: 'Unknown type' });
    }

    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: system_prompt },
                    { role: 'user', content: user_prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ error: errData.error || `API Error: ${response.statusText}` });
        }

        const data = await response.json();
        // Extract the JSON content from the assistant's message
        const result = JSON.parse(data.choices[0].message.content);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
