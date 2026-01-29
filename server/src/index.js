import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateVideo } from './videoGenerator.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Setup storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../temp/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });
app.post('/api/generate', upload.single('audio'), async (req, res) => {
    try {
        const audioFile = req.file;
        const config = JSON.parse(req.body.config);
        if (!audioFile) {
            return res.status(400).json({ error: 'Audio file is required' });
        }
        console.log('Starting video generation for:', config.surahName);
        const outputPath = await generateVideo(audioFile.path, config);
        res.download(outputPath, (err) => {
            // Cleanup files after download or error
            try {
                if (fs.existsSync(audioFile.path))
                    fs.unlinkSync(audioFile.path);
                if (fs.existsSync(outputPath))
                    fs.unlinkSync(outputPath);
            }
            catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
            if (err) {
                console.error('Download error:', err);
            }
        });
    }
    catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
app.get('/health', (req, res) => {
    res.send('OK');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map