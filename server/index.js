
import express from 'express';
import puppeteer from 'puppeteer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.post('/api/generate', upload.single('audio'), async (req, res) => {
    let browser;
    try {
        const config = JSON.parse(req.body.config);
        const audioFile = req.file;

        if (audioFile) {
            // Set the audio URL for the headless app
            config.audioUrl = `${req.protocol}://${req.get('host')}/uploads/${audioFile.filename}`;
        }

        console.log("Starting Puppeteer for video generation...");

        browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--autoplay-policy=no-user-gesture-required',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();

        // Set viewport according to resolution
        const dimensions = getDimensions(config.resolution, config.aspectRatio);
        await page.setViewport({
            width: Math.round(dimensions.width),
            height: Math.round(dimensions.height),
            deviceScaleFactor: 1,
        });

        // Inject config
        await page.evaluateOnNewDocument((cfg) => {
            window.__HEADLESS_CONFIG__ = cfg;
        }, config);

        // Function to receive the finished video
        let videoData;
        await page.exposeFunction('onExportComplete', (dataUrl) => {
            videoData = dataUrl;
        });

        // Load the app
        const appUrl = process.env.APP_URL || `http://localhost:${port}`;
        await page.goto(appUrl, { waitUntil: 'networkidle2' });

        // Wait for generation to complete (up to 10 minutes)
        console.log("Waiting for video generation to complete...");
        await page.waitForFunction(() => !!window.generatedVideoUrl, { timeout: 600000 });

        const resultUrl = await page.evaluate(() => window.generatedVideoUrl);

        // Fetch the blob data from the page
        const buffer = await page.evaluate(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });
        }, resultUrl);

        const videoBuffer = Buffer.from(buffer, 'base64');

        // Cleanup audio file
        if (audioFile) {
            fs.unlink(audioFile.path, () => {});
        }

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=quran-video.mp4');
        res.send(videoBuffer);

    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ message: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

function getDimensions(res, ratio) {
    const baseShortSide = {
        '360p': 360, '480p': 480, '720p': 720, '1080p': 1080,
        '2K': 1440, '4K': 2160, '8K': 4320,
    };
    const s = baseShortSide[res] || 1080;
    switch (ratio) {
        case '16:9': return { width: (s * 16) / 9, height: s };
        case '9:16': return { width: s, height: (s * 16) / 9 };
        case '1:1': return { width: s, height: s };
        case '4:5': return { width: s, height: (s * 5) / 4 };
        default: return { width: 1920, height: 1080 };
    }
}

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
