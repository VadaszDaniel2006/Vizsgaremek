const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'titkoskulcs');
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Érvénytelen token!' });
        }
    } else {
        res.status(401).json({ message: 'Nincs token, nem vagy jogosult!' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Hozzáférés megtagadva! Csak adminisztrátoroknak.' });
    }
};


module.exports = { protect, admin };