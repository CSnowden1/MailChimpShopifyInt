const express = require('express');
const router = express.Router();


let userDataStore = {}; // In practice, replace with a database or session storage

// Define segment requirements with dependencies
const segmentRequirements = {
  segment1: ['email', 'name'],
  segment2: ['service', 'paragraph'], // Assumes email and name are already stored from segment1
  segment3: ['meetingDate'] // Assumes data from segment1 and segment2 are already stored
};

function compileUserData(userId) {
  if (!userDataStore[userId]) {
    return {};
  }
  return Object.values(userDataStore[userId].forms).reduce((acc, form) => ({ ...acc, ...form }), {});
}





router.post('/addSub', async (req, res) => {
  const { userId, segmentId, formData } = req.body;

  // Check for valid segment ID
  if (!segmentRequirements[segmentId]) {
    return res.status(400).json({ error: 'Invalid segment ID' });
  }

  if (!userDataStore[userId]) {
    userDataStore[userId] = { forms: {} };
  }

  // Update existing data with new form data
  userDataStore[userId].forms[segmentId] = { ...userDataStore[userId].forms[segmentId], ...formData };

  // Compile all existing data for this user
  const userData = compileUserData(userId);

  // Check if the current segment's requirements are met
  if (hasRequiredFields(userData, segmentRequirements[segmentId])) {
    if (segmentId === 'segment3') { // Assume 'segment3' is the final step
      try {
        const response = await sendToMailchimp(userData);
        res.status(200).json({ message: "Complete data sent successfully", data: response });
        delete userDataStore[userId]; // Clear data after final step
      } catch (error) {
        console.error('Error sending data to Mailchimp:', error);
        res.status(500).json({ error: "Failed to send data to Mailchimp" });
      }
    } else {
      res.status(200).json({ message: "Data stored, awaiting next form submission." });
    }
  } else {
    res.status(400).json({ error: "Required data for this segment is incomplete." });
  }
});

function hasRequiredFields(data, fields) {
  return fields.every(field => data.hasOwnProperty(field) && data[field]);
}

module.exports = router;
