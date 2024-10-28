const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: {
    title: { type: String, required: true },
    mediacontent: { type: String, required: true }
  }
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
