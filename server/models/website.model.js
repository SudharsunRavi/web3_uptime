import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
    url: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    disabled: { 
        type: Boolean, 
        default: false 
    }
});

export default mongoose.model('Website', websiteSchema);
