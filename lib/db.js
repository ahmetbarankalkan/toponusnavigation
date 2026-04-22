// lib/db.js - MongoDB Adapter for MySQL-like queries
import connectDB from './mongodb';
import mongoose from 'mongoose';

// Room Schema (basit versiyon)
const RoomSchema = new mongoose.Schema({
  room_id: String,
  place_id: String,
  name: String,
  content: mongoose.Schema.Types.Mixed, // JSON field
  campaigns: mongoose.Schema.Types.Mixed, // JSON field
  // Diğer fieldlar...
}, { 
  collection: 'rooms',
  strict: false // Tüm fieldlara izin ver
});

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

// MySQL pool interface'i taklit eden adapter
const pool = {
  // SELECT query'leri
  async query(sql, params = []) {
    await connectDB();
    
    // SELECT query'leri parse et
    if (sql.includes('SELECT')) {
      // SELECT * FROM rooms WHERE room_id = ? AND place_id = ?
      const match = sql.match(/WHERE room_id = \? AND place_id = \?/);
      if (match && params.length >= 2) {
        const [roomId, placeId] = params;
        const rooms = await Room.find({ room_id: roomId, place_id: placeId }).lean();
        return [rooms]; // MySQL format: [rows, fields]
      }
      
      // Diğer SELECT sorguları...
      const rooms = await Room.find().lean();
      return [rooms];
    }
    
    // UPDATE query'leri
    if (sql.includes('UPDATE')) {
      // UPDATE rooms SET content = ? WHERE room_id = ? AND place_id = ?
      const match = sql.match(/UPDATE rooms SET content = \? WHERE room_id = \? AND place_id = \?/);
      if (match && params.length >= 3) {
        const [content, roomId, placeId] = params;
        
        // JSON string'i parse et
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        
        await Room.updateOne(
          { room_id: roomId, place_id: placeId },
          { $set: { content: parsedContent } }
        );
        
        return [{ affectedRows: 1 }];
      }
    }
    
    // Fallback
    console.warn('⚠️ Unsupported query:', sql);
    return [[]];
  }
};

export default pool;
