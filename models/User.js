const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  authId: { type: String, unique: true, required: true }, // Clave de Google
  email: String,
  nickname: String,
  schoolId: { type: String, default: null },
  lastSync: { type: Date, default: Date.now },

  stats: {
    score: { type: Number, default: 0 },
    lives: { type: Number, default: 3 },
    levels: {
      attention: { type: Number, default: 1 },
      memory: { type: Number, default: 1 },
      logic: { type: Number, default: 1 },
      emotions: { type: Number, default: 1 }
    },
    xp: { type: Object, default: {} }
  },

  // Historial vital para el reporte
  performanceHistory: [{
    gameId: String,
    date: Date,
    metrics: {
      reactionTime: Number,
      errors: Number,
      omissions: Number,
      levelPlayed: Number
    }
  }]
});

module.exports = mongoose.model('User', UserSchema);