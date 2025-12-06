// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONEXIÓN A BASE DE DATOS ---
const mongoUri = process.env.MONGO_URI; 
if (!mongoUri) console.error("FATAL: No existe la variable MONGO_URI");

mongoose.connect(mongoUri)
  .then(() => console.log('🟢 Base de Datos Conectada exitosamente'))
  .catch(err => console.error('🔴 Error conectando a DB:', err));

// --- 2. MODELO DE DATOS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  schoolId: { type: String, default: null },
  isPremium: { type: Boolean, default: false },
  lastSync: { type: Date, default: Date.now },
  stats: { type: Object, default: {} } // Guardamos todo el objeto stats aquí
});
const User = mongoose.model('User', UserSchema);

// --- 3. RUTAS (ENDPOINTS) ---

// Ruta de prueba para ver si el servidor vive
app.get('/', (req, res) => res.send('Servidor NeuroMind Funcionando 🚀'));

// Ruta de Sincronización 
app.post('/api/sync', async (req, res) => {
  const { username, stats, schoolId } = req.body;
  console.log(`📡 Recibiendo datos de: ${username}`);

  try {
    // Busca si existe, si no, lo crea (upsert)
    const user = await User.findOneAndUpdate(
      { username },
      { 
        $set: { 
          stats: stats, 
          lastSync: new Date(),
          schoolId: schoolId || null
        }
      },
      { new: true, upsert: true } // new: devuelve el dato actualizado, upsert: crea si no existe
    );
    
    res.json({ status: 'ok', isPremium: user.isPremium });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));