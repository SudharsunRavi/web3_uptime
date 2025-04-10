import mongoose from 'mongoose';

const websiteTickSchema = new mongoose.Schema({
    websiteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Website', 
        required: true 
    },
    validatorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Validator', 
        required: true 

    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['Good', 'Bad'], 
        required: true
    },
    latency: { 
        type: Number, 
        required: true 
    }
});

export default mongoose.model('WebsiteTick', websiteTickSchema);
