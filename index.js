// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const mailchimpBaseUrl = `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0`;


app.post('/add-contact', async (req, res) => {
    const { name, email, status, mergeFields, segmentId } = req.body; // Now accepting segmentId in the body

    try {
        // Adding a contact to a specific segment
        const response = await axios.post(`${mailchimpBaseUrl}/lists/${process.env.MAILCHIMP_LIST_ID}/segments/${segmentId}/members`, {
            email_address: email,
            status: status, // 'subscribed' or 'pending' for double opt-in
            merge_fields: mergeFields
        }, {
            auth: {
                username: 'anystring', // Mailchimp API key needs any string as the username
                password: process.env.MAILCHIMP_API_KEY
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error adding contact to segment:', error.response.data);
        res.status(500).json({ error: error.response.data });
    }
});


function handleApiError(error) {
    if (error.response) {
        console.error('API responded with a status:', error.response.status);
        console.error('Error details:', error.response.data);
        return error.response.data;
    } else if (error.request) {
        console.error('No response received:', error.request);
        return { message: 'No response from server' };
    } else {
        console.error('Error setting up request:', error.message);
        return { message: error.message };
    }
}




// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
