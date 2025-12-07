require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importamos el modelo y el motor psicológico (que crearás abajo)
const User = require('./models/User'); 
const { analyzeProfile } = require('./utils/PsychologyEngine'); 

const app = express();

app.use(cors());
app.use(express.json());

// --- CONEXIÓN A BASE DE DATOS ---
const mongoUri = process.env.MONGO_URI; 
if (!mongoUri) console.error("FATAL: Faltan credenciales MONGO_URI en .env");

mongoose.connect(mongoUri || 'mongodb://localhost:27017/neuromind_db')
  .then(() => console.log('🟢 Base de Datos Conectada'))
  .catch(err => console.error('🔴 Error DB:', err));

// --- RUTAS ---

app.get('/', (req, res) => res.send('NeuroMind API v1.0 Online 🚀'));

// RUTA 1: GUARDAR (Sync con Google Auth)
app.post('/api/sync', async (req, res) => {
  const { authId, email, nickname, stats, performanceHistory, schoolId } = req.body;
  console.log(`📡 Datos recibidos de: ${nickname || 'Usuario'}`);

  try {
    if (!authId) return res.status(400).json({ msg: "Falta AuthID" });

    let user = await User.findOne({ authId });

    if (!user) {
      console.log("✨ Usuario nuevo. Creando...");
      user = new User({ authId, email, nickname, stats, schoolId, performanceHistory });
    } else {
      // Actualizar Stats
      if (stats) user.stats = { ...user.stats, ...stats };
      
      // Actualizar Historial (evitando duplicados)
      if(performanceHistory?.length > 0) {
         const currentHistory = user.performanceHistory || [];
         const existingIds = new Set(currentHistory.map(h => h.gameId + new Date(h.date).getTime()));
         const newUnique = performanceHistory.filter(h => !existingIds.has(h.gameId + new Date(h.date).getTime()));
         if (newUnique.length > 0) user.performanceHistory.push(...newUnique);
      }
      if(schoolId) user.schoolId = schoolId;
    }
    
    user.lastSync = new Date();
    await user.save();
    res.json({ status: 'synced' });
    
  } catch (error) {
    console.error("🔴 Error Sync:", error);
    res.status(500).json({ error: error.message });
  }
});

// RUTA 2: REPORTE CIENTÍFICO (La que te faltaba)
app.get('/api/report/:authId', async (req, res) => {
  try {
    const user = await User.findOne({ authId: req.params.authId });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Analizamos el perfil
    const analysis = analyzeProfile(user);
    
    res.json({ stats: user.stats, analysis });
  } catch (error) {
    console.error("🔴 Error Reporte:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));