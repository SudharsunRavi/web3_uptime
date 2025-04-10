import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb+srv://susan:susan@uptime-web3.bw4w5vg.mongodb.net/?retryWrites=true&w=majority&appName=uptime-web3');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

export default connectDb;