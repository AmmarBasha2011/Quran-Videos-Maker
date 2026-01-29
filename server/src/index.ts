import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import os from 'os';
import osUtils from 'os-utils';
import { generateVideo } from './videoGenerator.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// In-memory job store
interface Job {
    id: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    outputPath?: string;
    audioPath?: string;
    error?: string;
    surahName: string;
}

const jobs = new Map<string, Job>();

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

    const jobId = uuidv4();
    const job: Job = {
        id: jobId,
        status: 'processing',
        progress: 0,
        audioPath: audioFile.path,
        surahName: config.surahName
    };
    jobs.set(jobId, job);

    console.log(`Job ${jobId} started for: ${config.surahName}`);

    // Run processing in background
    (async () => {
        try {
            const outputPath = await generateVideo(audioFile.path, config, (percent) => {
                const currentJob = jobs.get(jobId);
                if (currentJob) {
                    currentJob.progress = percent;
                }
            });

            const finishedJob = jobs.get(jobId);
            if (finishedJob) {
                finishedJob.status = 'completed';
                finishedJob.progress = 100;
                finishedJob.outputPath = outputPath;
            }
            console.log(`Job ${jobId} completed`);
        } catch (error) {
            console.error(`Job ${jobId} failed:`, error);
            const failedJob = jobs.get(jobId);
            if (failedJob) {
                failedJob.status = 'failed';
                failedJob.error = (error as Error).message;
            }
            // Cleanup audio if generation fails
            try {
                if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
            } catch (cleanupErr) {
                console.error('Cleanup error after gen failure:', cleanupErr);
            }
        }
    })();

    res.json({ jobId });

  } catch (error) {
    console.error('Initial generation error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        surahName: job.surahName
    });
});

app.get('/api/jobs/:id/download', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job || job.status !== 'completed' || !job.outputPath) {
        return res.status(404).json({ error: 'Video not ready or job not found' });
    }

    res.download(job.outputPath, (err) => {
        if (err) {
            console.error('Download error:', err);
        } else {
            // Cleanup after successful download
            try {
                if (job.audioPath && fs.existsSync(job.audioPath)) fs.unlinkSync(job.audioPath);
                if (job.outputPath && fs.existsSync(job.outputPath)) fs.unlinkSync(job.outputPath);
                jobs.delete(job.id);
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        }
    });
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/api/stats', (req, res) => {
  osUtils.cpuUsage((v) => {
    res.json({
      cpu: Math.round(v * 100),
      ram: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      totalRam: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      freeRam: Math.round(os.freemem() / 1024 / 1024 / 1024),
      platform: os.platform(),
      uptime: os.uptime()
    });
  });
});

// Fallback to index.html for SPA
if (fs.existsSync(distPath)) {
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
