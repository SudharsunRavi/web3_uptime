import mongoose from 'mongoose';

const validatorSchema = new mongoose.Schema({
    publicKey: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    ip: { 
        type: String, 
        required: true 
    }
});

export default mongoose.model('Validator', validatorSchema);
