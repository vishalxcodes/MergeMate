import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Bug', 'Feature Request', 'General'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true  // auto adds createdAt aur updatedAt
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;