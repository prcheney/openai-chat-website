const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

exports.handler = async function (event) {
    try {
        // Parse the incoming request
        const body = JSON.parse(event.body);
        const { email } = body;

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email is required' }),
            };
        }

        // Ghost Admin API details
        const GHOST_API_URL = 'https://kava-industry-report.ghost.io'; // Replace with your Ghost URL
        const GHOST_ADMIN_API_KEY = '6770489997928e0001f5fbc2:31a1f832b21c6b0961666c85da952efebcbd1ba9f52a7513e3d3890dae2ebc1c'; // Replace with your Admin API Key

        // Split Admin API Key into ID and secret
        const [id, secret] = GHOST_ADMIN_API_KEY.split(':');

        // Create a JWT
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
                aud: '/v3/admin/',
            },
            Buffer.from(secret, 'base64'),
            { header: { kid: id, alg: 'HS256' } }
        );

        // Send email to Ghost API
        const response = await fetch(`${GHOST_API_URL}/ghost/api/admin/members/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Ghost ${token}`,
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorData.errors[0].message }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email successfully added to the newsletter!' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong.' }),
        };
    }
};
