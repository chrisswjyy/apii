const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2008;

// Valid access tokens - Ganti dengan token yang aman untuk production
const VALID_TOKENS = {
    'chris-token-2024': { username: 'Chris', role: 'admin' },
    'admin-token-secure': { username: 'Admin', role: 'admin' },
    'super-admin-xyz': { username: 'SuperAdmin', role: 'superadmin' },
    'xziyy1153': { username: 'ziyyy', role: 'admin' },
    'chriswijaya': { username: 'chris', role: 'superadmin' },
    'nadia2006': { username: 'nadia', role: 'superadmin' },
    'thirr01': { username: 'thir', role: 'admin' },
    'swiper012': { username: 'swiper', role: 'admin' },
    'ozlxx': { username: 'ozlxxxx', role: 'admin' },
    'kyanzonots': { username: 'kyanzo', role: 'admin' },
    'JollGantenkBanget': { username: 'joll', role: 'admin' },
    'ZHAFFstore': { username: 'zhaff', role: 'admin' },
    'Fanzz': { username: 'fanz', role: 'admin' },
    'zev705': { username: 'zevv', role: 'admin' },
    'zxuan99': { username: 'zaskaiheuning', role: 'admin' },
    'GPP4YOU': { username: 'GPP4YOU', role: 'admin' },
    'gtau123': { username: 'gyenzo', role: 'admin' },
};

// Active sessions storage
const activeSessions = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// CONFIG - Sesuaikan dengan pengaturan Anda
const settings = {
    domain: 'https://chrisprivat.biz.id',
    apikey: 'ptla_G85ZkCxiyFIpIZWHXU1fQZzvePVx9UHKsYjRZWNCQ65',
    nestid: '5',
    egg: '15',
    loc: '1'
};

// Clean expired sessions
function cleanExpiredSessions() {
    const now = Date.now();
    for (const [sessionToken, session] of activeSessions.entries()) {
        if (now > session.expiresAt) {
            activeSessions.delete(sessionToken);
        }
    }
}

// Run cleanup every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

// Generate session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware untuk verifikasi session token
function verifySession(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Session token required'
        });
    }

    const session = activeSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
        if (session) {
            activeSessions.delete(token);
        }
        return res.status(403).json({
            success: false,
            message: 'Session expired or invalid'
        });
    }

    req.user = session.user;
    next();
}

// Endpoint untuk login dengan access token
app.post('/api/token-login', (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verifikasi access token
        const tokenData = VALID_TOKENS[accessToken];
        if (!tokenData) {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        // Generate session token
        const sessionToken = generateSessionToken();
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 jam

        // Simpan session
        activeSessions.set(sessionToken, {
            user: tokenData,
            expiresAt: expiresAt,
            createdAt: Date.now(),
            accessToken: accessToken
        });

        console.log(`Token login successful: ${tokenData.username} - Session: ${sessionToken.substring(0, 10)}...`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                username: tokenData.username,
                role: tokenData.role,
                sessionToken: sessionToken,
                expiresAt: expiresAt
            }
        });

    } catch (error) {
        console.error('Token login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Endpoint untuk verifikasi session
app.post('/api/verify-session', verifySession, (req, res) => {
    res.json({
        success: true,
        message: 'Session is valid',
        data: {
            username: req.user.username,
            role: req.user.role
        }
    });
});

// Endpoint untuk logout
app.post('/api/logout', verifySession, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        activeSessions.delete(token);
        console.log(`User ${req.user.username} logged out`);
    }
    
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Fungsi helper untuk capitalize nama
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Endpoint untuk membuat panel (dengan session authentication)
app.post('/api/create-panel', verifySession, async (req, res) => {
    try {
        const { username, ram } = req.body;

        if (!username || !ram) {
            return res.status(400).json({
                success: false,
                message: 'Username dan RAM harus diisi'
            });
        }

        let disknya, cpu;
        
        const ramConfigs = {
            "1000": { disk: "1000", cpu: "40" },
            "2000": { disk: "1000", cpu: "60" },
            "3000": { disk: "2000", cpu: "80" },
            "4000": { disk: "2000", cpu: "100" },
            "5000": { disk: "4000", cpu: "120" },
            "6000": { disk: "5000", cpu: "140" },
            "7000": { disk: "6000", cpu: "160" },
            "8000": { disk: "7000", cpu: "180" },
            "9000": { disk: "8000", cpu: "200" },
            "10000": { disk: "9000", cpu: "220" },
            "0": { disk: "0", cpu: "0" }
        };

        const config = ramConfigs[ram];
        if (!config) {
            return res.status(400).json({
                success: false,
                message: 'Pilihan RAM tidak valid'
            });
        }

        disknya = config.disk;
        cpu = config.cpu;

        const usernameLower = username.toLowerCase();
        const email = usernameLower + "@gmail.com";
        const name = capitalize(usernameLower) + " @chrisreseller";
        const password = usernameLower + "123";

        console.log('Creating user with:', {
            username: usernameLower,
            email,
            name,
            ram,
            disknya,
            cpu,
            requestedBy: req.user.username
        });

        // Step 1: Buat user
        const userResponse = await fetch(settings.domain + "/api/application/users", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + settings.apikey
            },
            body: JSON.stringify({
                email: email,
                username: usernameLower,
                first_name: name,
                last_name: "Panel User",
                language: "en",
                password: password
            })
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('User creation failed:', userResponse.status, errorText);
            return res.status(500).json({
                success: false,
                message: `Gagal membuat user: ${userResponse.status} - ${errorText}`
            });
        }

        const userData = await userResponse.json();
        if (userData.errors) {
            console.error('User creation error:', userData.errors);
            return res.status(500).json({
                success: false,
                message: `Error: ${JSON.stringify(userData.errors[0])}`
            });
        }

        const user = userData.attributes;
        const usr_id = user.id;

        // Step 2: Ambil informasi egg
        const eggResponse = await fetch(settings.domain + `/api/application/nests/${settings.nestid}/eggs/${settings.egg}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + settings.apikey
            }
        });

        if (!eggResponse.ok) {
            console.error('Egg fetch failed:', eggResponse.status);
            return res.status(500).json({
                success: false,
                message: `Error saat mengambil egg data: ${eggResponse.status}`
            });
        }

        const eggData = await eggResponse.json();
        if (!eggData.attributes) {
            return res.status(500).json({
                success: false,
                message: "Error: Tidak dapat membaca data egg"
            });
        }

        const startup_cmd = eggData.attributes.startup;
        if (!startup_cmd) {
            return res.status(500).json({
                success: false,
                message: "Error: Startup command tidak ditemukan"
            });
        }

        // Step 3: Buat server
        const serverResponse = await fetch(settings.domain + "/api/application/servers", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + settings.apikey
            },
            body: JSON.stringify({
                name: name,
                description: `Panel created at ${new Date().toISOString()} by ${req.user.username}`,
                user: usr_id,
                egg: parseInt(settings.egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_23",
                startup: startup_cmd,
                environment: {
                    "INST": "npm",
                    "USER_UPLOAD": "0",
                    "AUTO_UPDATE": "0",
                    "CMD_RUN": "npm start"
                },
                limits: {
                    memory: parseInt(ram),
                    swap: 0,
                    disk: parseInt(disknya),
                    io: 500,
                    cpu: parseInt(cpu)
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 5
                },
                deploy: {
                    locations: [parseInt(settings.loc)],
                    dedicated_ip: false,
                    port_range: []
                }
            })
        });

        if (!serverResponse.ok) {
            const errorText = await serverResponse.text();
            console.error('Server creation failed:', serverResponse.status, errorText);
            return res.status(500).json({
                success: false,
                message: `Gagal membuat server: ${serverResponse.status} - ${errorText}`
            });
        }

        const serverData = await serverResponse.json();
        if (serverData.errors) {
            console.error('Server creation error:', serverData.errors);
            return res.status(500).json({
                success: false,
                message: `Error: ${JSON.stringify(serverData.errors[0])}`
            });
        }

        const server = serverData.attributes;

        // Log activity
        console.log(`Panel created successfully by ${req.user.username} for user: ${usernameLower}`);

        // Response sukses
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: password
                },
                server: {
                    id: server.id,
                    name: server.name,
                    ram: ram === "0" ? "Unlimited" : (parseInt(ram) / 1000) + "GB",
                    disk: disknya === "0" ? "Unlimited" : (parseInt(disknya) / 1000) + "GB",
                    cpu: cpu === "0" ? "Unlimited" : cpu + "%"
                },
                login_url: settings.domain
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
});

// Endpoint untuk melihat active sessions (debug)
app.get('/api/sessions', (req, res) => {
    const sessions = [];
    for (const [token, session] of activeSessions.entries()) {
        sessions.push({
            token: token.substring(0, 10) + '...',
            username: session.user.username,
            role: session.user.role,
            createdAt: new Date(session.createdAt).toISOString(),
            expiresAt: new Date(session.expiresAt).toISOString()
        });
    }
    
    res.json({
        success: true,
        data: {
            totalSessions: sessions.length,
            sessions: sessions,
            validTokens: Object.keys(VALID_TOKENS)
        }
    });
});

// Endpoint test
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend server berjalan dengan baik!',
        timestamp: new Date().toISOString(),
        validTokens: Object.keys(VALID_TOKENS)
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Valid access tokens:');
    Object.keys(VALID_TOKENS).forEach(token => {
        console.log(`- ${token} (${VALID_TOKENS[token].username} - ${VALID_TOKENS[token].role})`);
    });
    console.log('\nEndpoints:');
    console.log('- POST /api/token-login');
    console.log('- POST /api/verify-session');
    console.log('- POST /api/create-panel');
    console.log('- POST /api/logout');
    console.log('- GET /api/sessions');
    console.log('- GET /api/test');
});

module.exports = app;
