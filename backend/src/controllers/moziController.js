const db = require('../config/db');

const getOsszesMozi = async (req, res) => {
    try {
        const [mozik] = await db.query('SELECT * FROM mozik');
        res.status(200).json(mozik);
    } catch (error) {
        console.error("Hiba a mozik lekérdezésekor:", error);
        res.status(500).json({ message: "Szerverhiba történt a mozik betöltésekor." });
    }
};

module.exports = {
    getOsszesMozi
};