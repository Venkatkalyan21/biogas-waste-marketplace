const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ thread: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);

