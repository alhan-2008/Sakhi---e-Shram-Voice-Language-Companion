import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { handleChatMessage, handleGenerateSpeech } from './server/gemini';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API route for Sakhi Gemini TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language, language_code } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }
    const result = await handleGenerateSpeech({
      text,
      language,
      language_code,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate speech' });
  }
});

// API route for Sakhi chat and help
app.post(['/api/chat', '/api/help'], async (req, res) => {
  try {
    const { message, language, language_code, actionKey, history } = req.body;
    if (!message && !actionKey) {
      res.status(400).json({ error: 'Message or actionKey is required' });
      return;
    }
    const result = await handleChatMessage({
      message: message || '',
      language,
      language_code,
      actionKey,
      history,
    });
    res.json(result);
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({
      error: 'Failed to process request',
      reply: 'தயவுசெய்து கீழே உள்ள அதிகாரப்பூர்வ இ-ஷ்ரம் தளத்தைப் பார்வையிடவும்.',
    });
  }
});

// Serve frontend dist if exists
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sakhi server running on http://0.0.0.0:${PORT}`);
});
