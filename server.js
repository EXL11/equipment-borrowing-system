// server.js - Backend API for Laptop & Equipment Borrowing System (PostgreSQL)
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('PostgreSQL Connected successfully:', result.rows[0]);
    });
});

// --------------------------------------------------------------------------
// DATABASE SEED DATA
// --------------------------------------------------------------------------
const SEED_USERS = [
    {
        username: "admin",
        password: "password",
        name: "อาจารย์สมศักดิ์ (IT Admin)",
        department: "เทคโนโลยีธุรกิจดิจิทัล",
        role: "admin",
        avatar: "T"
    },
    {
        username: "somchai",
        password: "password",
        name: "สมชาย ใจดี",
        department: "นักศึกษา ปี 3",
        role: "user",
        avatar: "S"
    },
    {
        username: "somying",
        password: "password",
        name: "สมหญิง รักดี",
        department: "นักศึกษา ปี 2",
        role: "user",
        avatar: "S"
    }
];

const SEED_EQUIPMENT = [
    {
        id: "eq-1",
        name: "Notebook Dell Latitude 5420",
        category: "Notebook",
        code: "BTEC-NB-001",
        specs: "Intel Core i5-1135G7, RAM 16GB, SSD 512GB, Windows 11",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-2",
        name: "MacBook Pro M3 Pro 14\"",
        category: "Notebook",
        code: "BTEC-NB-002",
        specs: "Apple M3 Pro Chip, 18GB Unified Memory, SSD 512GB, macOS Sonoma",
        status: "Borrowed",
        borrowedByUsername: "somchai",
        borrowDate: "2026-05-20",
        expectedReturnDate: "2026-05-27"
    },
    {
        id: "eq-3",
        name: "Notebook HP EliteBook 840 G8",
        category: "Notebook",
        code: "BTEC-NB-003",
        specs: "Intel Core i7-1185G7, RAM 16GB, SSD 512GB, Windows 10 Pro",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-4",
        name: "Wireless Mouse Logistics MX Master 3S",
        category: "Mouse",
        code: "BTEC-MS-001",
        specs: "8000 DPI, Silent Click, Bluetooth / Logi Bolt, Ergonomic Design",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-5",
        name: "Wireless Mouse Logistics Pebble M350",
        category: "Mouse",
        code: "BTEC-MS-002",
        specs: "Ultra-portable, Silent clicking, Bluetooth and USB Receiver",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-6",
        name: "Mechanical Keyboard Royal Kludge RK84",
        category: "Keyboard",
        code: "BTEC-KB-001",
        specs: "75% Layout, Hot-swappable tactile Brown Switch, RGB backlit",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-7",
        name: "Keyboard Logitech K380 Multi-Device",
        category: "Keyboard",
        code: "BTEC-KB-002",
        specs: "Slim, compact Bluetooth keyboard for PC, laptop, phone or tablet",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-8",
        name: "Dell USB-C Charger 65W",
        category: "Charger",
        code: "BTEC-CG-001",
        specs: "Power Delivery (PD) Fast charger with USB Type-C Cable",
        status: "Available",
        borrowedByUsername: null,
        borrowDate: null,
        expectedReturnDate: null
    },
    {
        id: "eq-9",
        name: "MacBook USB-C Power Adapter 96W",
        category: "Charger",
        code: "BTEC-CG-002",
        specs: "Apple USB-C Power Adapter for rapid charging (includes USB-C to MagSafe 3 cable)",
        status: "Borrowed",
        borrowedByUsername: "somying",
        borrowDate: "2026-05-24",
        expectedReturnDate: "2026-05-31"
    }
];

const SEED_HISTORY = [
    {
        id: "hist-1",
        timestamp: "2026-05-20T10:15:30.000Z",
        type: "borrow",
        userId: "somchai",
        userName: "สมชาย ใจดี",
        userDept: "นักศึกษา ปี 3",
        itemId: "eq-2",
        itemName: "MacBook Pro M3 Pro 14\"",
        itemCode: "BTEC-NB-002",
        borrowDate: "2026-05-20",
        expectedReturnDate: "2026-05-27",
        actualReturnDate: null,
        status: "Borrowed"
    },
    {
        id: "hist-2",
        timestamp: "2026-05-24T09:42:15.000Z",
        type: "borrow",
        userId: "somying",
        userName: "สมหญิง รักดี",
        userDept: "นักศึกษา ปี 2",
        itemId: "eq-9",
        itemName: "MacBook USB-C Power Adapter 96W",
        itemCode: "BTEC-CG-002",
        borrowDate: "2026-05-24",
        expectedReturnDate: "2026-05-31",
        actualReturnDate: null,
        status: "Borrowed"
    }
];

// Initialize Database Tables & Mock Seed Data
async function initDb() {
    // Create Tables if not exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            department TEXT,
            role TEXT DEFAULT 'user',
            avatar TEXT
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS equipment (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            specs TEXT,
            status TEXT DEFAULT 'Available',
            borrowed_by_username TEXT REFERENCES users(username) ON DELETE SET NULL,
            borrow_date TEXT,
            expected_return_date TEXT
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_dept TEXT,
            item_id TEXT NOT NULL,
            item_name TEXT NOT NULL,
            item_code TEXT NOT NULL,
            borrow_date TEXT NOT NULL,
            expected_return_date TEXT,
            actual_return_date TEXT,
            status TEXT NOT NULL
        );
    `);

    // Seed Users
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    if (parseInt(userCount.rows[0].count, 10) === 0) {
        for (const user of SEED_USERS) {
            await pool.query(
                "INSERT INTO users (username, password, name, department, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)",
                [user.username, user.password, user.name, user.department, user.role, user.avatar]
            );
        }
        console.log("Seeded default users successfully.");
    }

    // Seed Equipment
    const eqCount = await pool.query("SELECT COUNT(*) as count FROM equipment");
    if (parseInt(eqCount.rows[0].count, 10) === 0) {
        for (const eq of SEED_EQUIPMENT) {
            await pool.query(
                "INSERT INTO equipment (id, name, category, code, specs, status, borrowed_by_username, borrow_date, expected_return_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [eq.id, eq.name, eq.category, eq.code, eq.specs, eq.status, eq.borrowedByUsername, eq.borrowDate, eq.expectedReturnDate]
            );
        }
        console.log("Seeded default equipment successfully.");
    }

    // Seed History
    const histCount = await pool.query("SELECT COUNT(*) as count FROM history");
    if (parseInt(histCount.rows[0].count, 10) === 0) {
        for (const hist of SEED_HISTORY) {
            await pool.query(
                "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, actual_return_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
                [hist.id, hist.timestamp, hist.type, hist.userId, hist.userName, hist.userDept, hist.itemId, hist.itemName, hist.itemCode, hist.borrowDate, hist.expectedReturnDate, hist.actualReturnDate, hist.status]
            );
        }
        console.log("Seeded default history logs successfully.");
    }
}

// Helper: Format Database Equipment items to fit Frontend expectations
function formatEquipment(items) {
    return items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        code: item.code,
        specs: item.specs,
        status: item.status,
        borrowedBy: item.borrowed_by_username ? {
            username: item.borrowed_by_username,
            name: item.u_name,
            department: item.u_dept,
            borrowDate: item.borrow_date,
            expectedReturnDate: item.expected_return_date
        } : null
    }));
}

// Helper: Format History Logs to fit Frontend expectations (camelCase keys)
function formatHistory(logs) {
    return logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        type: log.type,
        userId: log.user_id,
        userName: log.user_name,
        userDept: log.user_dept,
        itemId: log.item_id,
        itemName: log.item_name,
        itemCode: log.item_code,
        borrowDate: log.borrow_date,
        expectedReturnDate: log.expected_return_date,
        actualReturnDate: log.actual_return_date,
        status: log.status
    }));
}

// --------------------------------------------------------------------------
// AUTH API ENDPOINTS
// --------------------------------------------------------------------------

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username.toLowerCase().trim()]);
        const user = result.rows[0];
        if (user && user.password === password) {
            const { password: _, ...userMeta } = user;
            res.json({ success: true, user: userMeta });
        } else {
            res.status(401).json({ success: false, message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { username, password, name, department } = req.body;
    const cleanUsername = username.toLowerCase().trim();

    try {
        const existing = await pool.query("SELECT username FROM users WHERE username = $1", [cleanUsername]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว" });
        }

        const avatar = name ? name.charAt(0).toUpperCase() : "U";
        const role = "user"; // Hard enforce user role for public signups

        await pool.query(
            "INSERT INTO users (username, password, name, department, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)",
            [cleanUsername, password, name, department, role, avatar]
        );

        res.json({ success: true, user: { username: cleanUsername, name, department, role, avatar } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get User List (Dynamic authorized list)
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query("SELECT username, name, department, role, avatar FROM users");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------------------------------------------------------
// EQUIPMENT API ENDPOINTS
// --------------------------------------------------------------------------

// Get All Equipment
app.get('/api/equipment', async (req, res) => {
    try {
        const query = `
            SELECT e.*, u.name as u_name, u.department as u_dept
            FROM equipment e
            LEFT JOIN users u ON e.borrowed_by_username = u.username
        `;
        const result = await pool.query(query);
        res.json(formatEquipment(result.rows));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Equipment (Admin Only)
app.post('/api/equipment', async (req, res) => {
    const { name, category, code, specs, userRole } = req.body;

    if (userRole !== 'admin') {
        return res.status(403).json({ error: "สิทธิ์การเข้าใช้งานเฉพาะผู้ดูแลเท่านั้น" });
    }

    try {
        const cleanCode = code.toUpperCase().trim();
        const existing = await pool.query("SELECT code FROM equipment WHERE code = $1", [cleanCode]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: `รหัสครุภัณฑ์ ${code} นี้ถูกขึ้นทะเบียนแล้ว` });
        }

        const id = "eq-" + Date.now();
        await pool.query(
            "INSERT INTO equipment (id, name, category, code, specs, status) VALUES ($1, $2, $3, $4, $5, 'Available')",
            [id, name, category, cleanCode, specs || "ไม่มีรายละเอียดสเปก"]
        );

        res.json({ success: true, message: "ขึ้นทะเบียนอุปกรณ์สำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Equipment (Admin Only)
app.put('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, code, specs, status, borrowedBy, userRole } = req.body;

    if (userRole !== 'admin') {
        return res.status(403).json({ error: "สิทธิ์การเข้าใช้งานเฉพาะผู้ดูแลเท่านั้น" });
    }

    try {
        const cleanCode = code.toUpperCase().trim();
        const itemRes = await pool.query("SELECT * FROM equipment WHERE id = $1", [id]);
        const item = itemRes.rows[0];
        if (!item) {
            return res.status(404).json({ error: "ไม่พบอุปกรณ์ในระบบ" });
        }

        // Verify code is not taken by another item
        const duplicate = await pool.query("SELECT id FROM equipment WHERE code = $1 AND id != $2", [cleanCode, id]);
        if (duplicate.rows.length > 0) {
            return res.status(400).json({ error: `รหัสครุภัณฑ์ ${code} ซ้ำกับอุปกรณ์เครื่องอื่น` });
        }

        let dbStatus = status;
        let dbUser = null;
        let dbBorrowDate = null;
        let dbReturnDate = null;

        if (status === "Borrowed" && borrowedBy) {
            dbUser = borrowedBy.username;
            dbBorrowDate = borrowedBy.borrowDate;
            dbReturnDate = borrowedBy.expectedReturnDate;

            // Handle logging if it transition to Borrowed
            if (item.status !== "Borrowed") {
                const histId = "hist-" + Date.now();
                await pool.query(
                    "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, status) VALUES ($1, $2, 'borrow', $3, $4, $5, $6, $7, $8, $9, $10, 'Borrowed')",
                    [histId, new Date().toISOString(), dbUser, borrowedBy.name, borrowedBy.department, id, name, cleanCode, dbBorrowDate, dbReturnDate]
                );
            }
        } else {
            dbStatus = "Available";
            // Handle logging if it transition from Borrowed to Available
            if (item.status === "Borrowed" && item.borrowed_by_username) {
                const todayStr = new Date().toISOString().split('T')[0];
                
                // Update active log
                await pool.query(
                    "UPDATE history SET status = 'Returned', actual_return_date = $1 WHERE item_id = $2 AND user_id = $3 AND status = 'Borrowed'",
                    [todayStr, id, item.borrowed_by_username]
                );

                // Insert return log
                const userRes = await pool.query("SELECT name, department FROM users WHERE username = $1", [item.borrowed_by_username]);
                const prevUser = userRes.rows[0];
                const returnHistId = "hist-" + Date.now();
                await pool.query(
                    "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, actual_return_date, status) VALUES ($1, $2, 'return', $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Returned')",
                    [returnHistId, new Date().toISOString(), item.borrowed_by_username, prevUser ? prevUser.name : "ผู้ใช้งาน", prevUser ? prevUser.department : "", id, name, cleanCode, item.borrow_date, item.expected_return_date, todayStr]
                );
            }
        }

        await pool.query(
            "UPDATE equipment SET name = $1, category = $2, code = $3, specs = $4, status = $5, borrowed_by_username = $6, borrow_date = $7, expected_return_date = $8 WHERE id = $9",
            [name, category, cleanCode, specs, dbStatus, dbUser, dbBorrowDate, dbReturnDate, id]
        );

        res.json({ success: true, message: "บันทึกและแก้ไขข้อมูลอุปกรณ์สำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Equipment (Admin Only)
app.delete('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    const { userRole } = req.body;

    if (userRole !== 'admin') {
        return res.status(403).json({ error: "สิทธิ์การเข้าใช้งานเฉพาะผู้ดูแลเท่านั้น" });
    }

    try {
        await pool.query("DELETE FROM equipment WHERE id = $1", [id]);
        res.json({ success: true, message: "ลบอุปกรณ์ออกจากระบบสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------------------------------------------------------
// BORROW & RETURN API ENDPOINTS
// --------------------------------------------------------------------------

// Borrow Equipment
app.post('/api/equipment/:id/borrow', async (req, res) => {
    const { id } = req.params;
    const { username, name, department, expectedReturnDate } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        const itemRes = await pool.query("SELECT * FROM equipment WHERE id = $1", [id]);
        const item = itemRes.rows[0];
        if (!item || item.status === "Borrowed") {
            return res.status(400).json({ error: "อุปกรณ์ไม่พร้อมสำหรับทำรายการยืม" });
        }

        // Update Equipment
        await pool.query(
            "UPDATE equipment SET status = 'Borrowed', borrowed_by_username = $1, borrow_date = $2, expected_return_date = $3 WHERE id = $4",
            [username, todayStr, expectedReturnDate, id]
        );

        // Create History Log
        const histId = "hist-" + Date.now();
        await pool.query(
            "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, status) VALUES ($1, $2, 'borrow', $3, $4, $5, $6, $7, $8, $9, $10, 'Borrowed')",
            [histId, new Date().toISOString(), username, name, department, id, item.name, item.code, todayStr, expectedReturnDate]
        );

        res.json({ success: true, message: "ทำรายการยืมอุปกรณ์เรียนสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Return Equipment
app.post('/api/equipment/:id/return', async (req, res) => {
    const { id } = req.params;
    const { username, userRole } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        const itemRes = await pool.query("SELECT * FROM equipment WHERE id = $1", [id]);
        const item = itemRes.rows[0];
        if (!item || item.status === "Available") {
            return res.status(400).json({ error: "อุปกรณ์ส่งคืนเข้าระบบเรียบร้อยแล้ว" });
        }

        // Check rights: borrower or admin
        if (userRole !== 'admin' && item.borrowed_by_username !== username) {
            return res.status(403).json({ error: "สิทธิ์การส่งคืนเฉพาะผู้ยืมหรือผู้ดูแลเท่านั้น" });
        }

        const borrowerUsername = item.borrowed_by_username;
        
        // Get user details
        const userRes = await pool.query("SELECT name, department FROM users WHERE username = $1", [borrowerUsername]);
        const borrower = userRes.rows[0];
        const borrowerName = borrower ? borrower.name : "ผู้ยืม";
        const borrowerDept = borrower ? borrower.department : "";

        // Update active history log
        await pool.query(
            "UPDATE history SET status = 'Returned', actual_return_date = $1 WHERE item_id = $2 AND user_id = $3 AND status = 'Borrowed'",
            [todayStr, id, borrowerUsername]
        );

        // Add return log
        const returnHistId = "hist-" + Date.now();
        await pool.query(
            "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, actual_return_date, status) VALUES ($1, $2, 'return', $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Returned')",
            [returnHistId, new Date().toISOString(), borrowerUsername, borrowerName, borrowerDept, id, item.name, item.code, item.borrow_date, item.expected_return_date, todayStr]
        );

        // Reset Equipment Columns
        await pool.query(
            "UPDATE equipment SET status = 'Available', borrowed_by_username = NULL, borrow_date = NULL, expected_return_date = NULL WHERE id = $1",
            [id]
        );

        res.json({ success: true, message: "ส่งคืนอุปกรณ์เรียบร้อย" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------------------------------------------------------
// HISTORY API ENDPOINTS
// --------------------------------------------------------------------------
app.get('/api/history', async (req, res) => {
    const { username, userRole } = req.query;
    try {
        let historyLogs;
        if (userRole === 'admin') {
            const result = await pool.query("SELECT * FROM history ORDER BY timestamp DESC");
            historyLogs = result.rows;
        } else if (username) {
            const result = await pool.query("SELECT * FROM history WHERE user_id = $1 ORDER BY timestamp DESC", [username.toLowerCase().trim()]);
            historyLogs = result.rows;
        } else {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลรหัสผู้ใช้งานหรือระดับสิทธิ์" });
        }
        res.json(formatHistory(historyLogs));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset System Database
app.post('/api/admin/reset', async (req, res) => {
    const { userRole } = req.body;
    if (userRole !== 'admin') {
        return res.status(403).json({ error: "สิทธิ์การเข้าใช้งานเฉพาะผู้ดูแลเท่านั้น" });
    }

    try {
        // Clear all tables
        await pool.query("DELETE FROM history");
        await pool.query("DELETE FROM equipment");
        await pool.query("DELETE FROM users");

        // Seed everything fresh
        for (const user of SEED_USERS) {
            await pool.query(
                "INSERT INTO users (username, password, name, department, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)",
                [user.username, user.password, user.name, user.department, user.role, user.avatar]
            );
        }

        for (const eq of SEED_EQUIPMENT) {
            await pool.query(
                "INSERT INTO equipment (id, name, category, code, specs, status, borrowed_by_username, borrow_date, expected_return_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [eq.id, eq.name, eq.category, eq.code, eq.specs, eq.status, eq.borrowedByUsername, eq.borrowDate, eq.expectedReturnDate]
            );
        }

        for (const hist of SEED_HISTORY) {
            await pool.query(
                "INSERT INTO history (id, timestamp, type, user_id, user_name, user_dept, item_id, item_name, item_code, borrow_date, expected_return_date, actual_return_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
                [hist.id, hist.timestamp, hist.type, hist.userId, hist.userName, hist.userDept, hist.itemId, hist.itemName, hist.itemCode, hist.borrowDate, hist.expectedReturnDate, hist.actualReturnDate, hist.status]
            );
        }

        res.json({ success: true, message: "รีเซ็ตตารางข้อมูลสู่ค่าตั้งต้นสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server & Init DB
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend Server starts on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Database initialization failed:", err);
});
