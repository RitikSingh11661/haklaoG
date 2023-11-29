require('dotenv').config();
const path = require('path');
const express = require('express');
const { createServer } = require('http');
const app = express();
const server = createServer(app);
const cors = require('cors');
const { adminRoutes } = require('./routes/admin.routes');
const { userRoutes } = require('./routes/user.routes');
const { reportRoutes } = require('./routes/report.routes');
const { connection } = require('./configs/db');
const { locationRoutes } = require('./routes/location.routes');
const { callRoutes } = require('./routes/call.routes');
// const { getIO, initIO } = require('./configs/server');
const { verifyToken } = require('./middlewares/auth.middleware');

app.use(express.json());
app.use(cors());

app.use('/', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => { res.send('Home page') })
app.use('/users', userRoutes);
app.use('/location', locationRoutes);
app.use('/admins', adminRoutes);
app.use(verifyToken);
app.use('/reports', reportRoutes);
app.use('/calls', callRoutes)

// initIO(server);

server.listen(process.env.port, async () => {
  try {
    await connection;
    console.log('Database connection established');
  } catch (e) {
    console.log(e.message);
  }
  // getIO();
  console.log(`Server is live at port ${process.env.port}`);
})