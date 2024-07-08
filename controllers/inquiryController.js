const mailchimp = require('@mailchimp/mailchimp_marketing');
const md5 = require('md5');
const nodeSchedule = require('node-schedule');
const dotenv = require('dotenv');

dotenv.config();

mailchimp.setConfig({
  apiKey:'e5ea787404e10c64951625f1c4c874f0-us22',
  server:'us22'
});

const emailJobs = {}; // Store references to scheduled jobs

async function updateMemberTags(listId, email, tags) {
  try {
    const subscriberHash = md5(email.toLowerCase());
    await mailchimp.lists.updateListMemberTags(listId, subscriberHash, { tags });
  } catch (error) {
    console.error(`Error updating tags for ${email}: ${error.message}`);
    throw error;
  }
}



const handleBasicInquiry = async (req, res) => {
  console.log('Basic inquiry route hit');
  const { email } = req.body;
  console.log(req.body);
  if (!email) {
    console.error('Missing required fields: name or email');
    return res.status(400).json({ message: 'Missing required fields: name or email' });
  }

  const listId = process.env.MAILCHIMP_LIST_ID;
  const subscriberHash = md5(email.toLowerCase());
  addUser(email, listId)

  try {
    await addUser(email, listId);
    await mailchimp.lists.updateListMemberTags(
      listId,
      subscriberHash,
      {
        tags: [
          { name: "Basic Inquiry", status: "active" }
        ],
      }
    );
    scheduleEmail(email, listId, 60); // Schedule follow-up email in 60 minutes
    res.status(200).json({ message: 'Basic inquiry saved and follow-up email scheduled' });
  } catch (error) {
    console.error(`Error handling basic inquiry: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



async function addUser(email, listId) {
   try {
    await mailchimp.lists.addListMember(listId, {
    email_address: email,
    status: "subscribed",
  });
   } catch (error) {}
}


function scheduleEmail(email, listId, delayInMinutes) {
  const job = nodeSchedule.scheduleJob(Date.now() + delayInMinutes * 60000, async function () {
    try {
      const tags = [{ name: 'follow-up-email', status: 'active' }];
      await updateMemberTags(listId, email, tags);
      delete emailJobs[email];
    } catch (error) {
      console.error(`Error scheduling follow-up email for ${email}: ${error.message}`);
    }
  });
  emailJobs[email] = job;
}

const handleDetailedInquiry = async (req, res) => {
  console.log('Detailed inquiry route hit');
  const { name, email, service, description } = req.body;
  console.log(req.body);

  if (!name || !email || !service || !description) {
    console.error('Missing required fields');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const listId = process.env.MAILCHIMP_LIST_ID;

  try {
    await updateMemberTags(listId, email, [{ name: 'detailed-info', status: 'active' }]);
    res.status(200).json({ message: 'Detailed inquiry saved' });
  } catch (error) {
    console.error(`Error handling detailed inquiry: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const handleCompleteInquiry = async (req, res) => {
  console.log('Complete inquiry route hit');
  const { name, email, service, description } = req.body;

  if (!name || !email || !service || !description) {
    console.error('Missing required fields');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const listId = process.env.MAILCHIMP_LIST_ID;

  try {
    await updateMemberTags(listId, email, [{ name: 'complete-info', status: 'active' }]);
    if (emailJobs[email]) {
      emailJobs[email].cancel(); // Cancel any scheduled follow-up email
      delete emailJobs[email];
    }
    res.status(200).json({ message: 'Complete inquiry saved' });
  } catch (error) {
    console.error(`Error handling complete inquiry: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  handleBasicInquiry,
  handleDetailedInquiry,
  handleCompleteInquiry
};
