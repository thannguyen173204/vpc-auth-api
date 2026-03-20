import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    refresh_token: {
        type: String,
        require: true,
        unique: true
    },
    expires_at: {
        type: Date,
        require: true
    }
}, {
    timestamps: true
})
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
const Session = mongoose.model('Session', sessionSchema);
export default Session;