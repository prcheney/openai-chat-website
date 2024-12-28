const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

exports.handler = async function (event) {
    try {
        // Parse the request body to get the email
        const body = JSON.parse(event.body);
        const { email } = body;

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email is required' }),
            };
        }

        // Retrieve environment variables
        const GHOST_API_URL = process.env.GHOST_API_URL; // Ghost API URL
        const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY; // Admin API Key

        // Validate that the environment variables exist
        if (!GHOST_API_URL || !GHOST_ADMIN_API_KEY) {
            console.error('Environment variables missing');
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Server configuration error: Missing environment variables.',
                }),
            };
        }

        // Split the Admin API Key into ID and Secret
        const [id, secret] = GHOST_ADMIN_API_KEY.split(':');

        // Decode the secret from hex
        const decodedSecret = Buffer.from(secret, 'hex');

        // Generate the JWT
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
                aud: '/v3/admin/', // Audience for Ghost Admin API
            },
            decodedSecret,
            { header: { kid: id, alg: 'HS256' } } // Include Key ID and algorithm
        );

        // Send the email to Ghost
        const response = await fetch(`${GHOST_API_URL}/ghost/api/admin/members/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Ghost ${token}`,
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error adding email:', data.errors);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.errors[0].message }),
            };
        }

        console.log('Successfully added email:', email);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email successfully added to the newsletter!' }),
        };
    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong.' }),
        };
    }
};
