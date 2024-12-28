const fetch = require('node-fetch');

exports.handler = async function (event) {
    try {
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response: botReply }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong.' }),
        };
    }
};
