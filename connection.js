const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('Connected to the MongoDB');
    } catch (error) {
        console.error('Failed to connect to the MongoDB:', error);
        throw error;
    }
}

connectToDatabase();
