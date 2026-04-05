const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes'); 
const moziRoutes = require('./routes/moziRoutes');



const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(helmet());

app.use(cors({
    origin: 'http://localhost:8090', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(morgan('dev'));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/filmek', movieRoutes);
app.use('/api/sorozatok', seriesRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', searchRoutes); 

app.use('/api/mozik', moziRoutes);

app.use('/api/contact', contactRoutes);


app.use((req, res) => {
    res.status(404).json({ message: 'Az útvonal nem található' });
});

module.exports = app;