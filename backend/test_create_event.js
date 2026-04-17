const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        const event = await Event.create({
            title: 'Test Validate',
            date: new Date(),
            created_by: new mongoose.Types.ObjectId() // Fake ID
        });
        console.log('Success:', event);
    } catch (err) {
        console.error('Validation Error Details:', JSON.stringify(err.errors, null, 2));
    }
    process.exit(0);
});
