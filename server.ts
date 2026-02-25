import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("scheduler.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    building TEXT,
    floor INTEGER,
    capacity INTEGER,
    type TEXT,
    status TEXT DEFAULT 'available',
    temp REAL,
    humidity REAL
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT,
    name TEXT,
    instructor TEXT,
    start_time TEXT,
    end_time TEXT,
    day_of_week TEXT,
    batch TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT,
    class_a_id INTEGER,
    class_b_id INTEGER,
    status TEXT DEFAULT 'pending',
    description TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );
`);

// Seed Data
const seedRooms = [
  ['RM-101', 'Lab 101', 'North Wing', 1, 50, 'Lab', 'available', 22.4, 42],
  ['RM-102', 'Studio A', 'North Wing', 1, 30, 'Studio', 'occupied', 24.1, 51],
  ['RM-103', 'Seminar Hall 1', 'North Wing', 1, 100, 'Lecture', 'available', 21.5, 45],
  ['RM-201', 'Workshop 201', 'South Wing', 2, 60, 'Workshop', 'occupied', 23.2, 48],
  ['RM-202', 'Workshop 202', 'South Wing', 2, 80, 'Workshop', 'available', 21.8, 38],
  ['RM-204', 'Lab 204', 'South Wing', 2, 45, 'Lab', 'occupied', 22.8, 44],
  ['RM-301', 'Conf. Room 1', 'Main Block', 3, 15, 'Meeting', 'available', 22.1, 41],
  ['RM-302', 'Conf. Room 4', 'Main Block', 3, 20, 'Meeting', 'occupied', 23.0, 45],
  ['RM-401', 'Main Lab 4', 'Science Wing', 4, 40, 'Lab', 'occupied', 22.5, 43],
  ['RM-402', 'Research Hub', 'Science Wing', 4, 40, 'Lab', 'conflict', 22.2, 40],
  ['RM-105', 'Lecture Hall 1', 'East Wing', 1, 120, 'Lecture', 'available', 22.0, 40],
  ['RM-106', 'Lecture Hall 2', 'East Wing', 1, 120, 'Lecture', 'available', 21.8, 42],
];

const insertRoom = db.prepare('INSERT OR IGNORE INTO rooms (id, name, building, floor, capacity, type, status, temp, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
seedRooms.forEach(room => insertRoom.run(...room));

const seedClasses = [
  ['RM-101', 'Advanced Algorithms', 'Dr. Sarah Connor', '09:00', '11:00', 'Monday', 'Batch 11'],
  ['RM-102', 'Advanced UI/UX', 'Prof. Miller', '10:00', '12:00', 'Tuesday', 'Batch 11'],
  ['RM-103', 'Soft Skills Workshop', 'Jane Doe', '08:00', '10:00', 'Thursday', 'Batch 11'],
  ['RM-201', 'Human Computer Interaction', 'Prof. Miller', '10:00', '12:00', 'Tuesday', 'Batch 11'],
  ['RM-302', 'Faculty Meeting', 'Admin', '10:00', '12:00', 'Tuesday', 'Staff'],
  ['RM-401', 'Networking Lab', 'Dr. Sarah Jenkins', '10:30', '11:30', 'Monday', 'Batch 11'],
  ['RM-402', 'Machine Learning Lab', 'Dr. Smith', '14:00', '16:00', 'Wednesday', 'Batch 11'],
  ['RM-402', 'Physics 101', 'Dr. Jones', '14:30', '16:30', 'Wednesday', 'Batch 14'],
  ['RM-204', 'Cybersecurity Ethics', 'Dr. Smith', '13:00', '15:00', 'Friday', 'Batch 11'],
];

const insertClass = db.prepare('INSERT OR IGNORE INTO classes (room_id, name, instructor, start_time, end_time, day_of_week, batch) VALUES (?, ?, ?, ?, ?, ?, ?)');
seedClasses.forEach(c => insertClass.run(...c));

// Seed Conflict
db.exec(`
  INSERT OR IGNORE INTO conflicts (room_id, class_a_id, class_b_id, description)
  VALUES ('RM-402', 4, 5, 'Machine Learning Lab overlaps with Physics 101')
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/rooms", (req, res) => {
    const rooms = db.prepare('SELECT * FROM rooms').all();
    res.json(rooms);
  });

  app.get("/api/schedule", (req, res) => {
    const schedule = db.prepare('SELECT * FROM classes').all();
    res.json(schedule);
  });

  app.get("/api/conflicts", (req, res) => {
    const conflicts = db.prepare(`
      SELECT c.*, r.name as room_name 
      FROM conflicts c 
      JOIN rooms r ON c.room_id = r.id
      WHERE c.status = 'pending'
    `).all();
    res.json(conflicts);
  });

  app.get("/api/stats", (req, res) => {
    const totalRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
    const occupiedRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'").get().count;
    const conflicts = db.prepare("SELECT COUNT(*) as count FROM conflicts WHERE status = 'pending'").get().count;
    
    res.json({
      totalRooms,
      occupiedRooms,
      conflicts,
      utilization: Math.round((occupiedRooms / totalRooms) * 100)
    });
  });

  app.post("/api/rooms", (req, res) => {
    const { id, name, building, floor, capacity, type, status } = req.body;
    try {
      db.prepare('INSERT INTO rooms (id, name, building, floor, capacity, type, status, temp, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, name, building, floor, capacity, type, status || 'available', 22.0, 40.0);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const { name, building, floor, capacity, type, status } = req.body;
    try {
      db.prepare('UPDATE rooms SET name = ?, building = ?, floor = ?, capacity = ?, type = ?, status = ? WHERE id = ?')
        .run(name, building, floor, capacity, type, status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/resolve", (req, res) => {
    const { conflictId, resolution } = req.body;
    db.prepare("UPDATE conflicts SET status = 'resolved' WHERE id = ?").run(conflictId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
