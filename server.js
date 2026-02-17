import 'dotenv/config';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const PORT = process.env.PORT || 3001;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('API key loaded:', process.env.ANTHROPIC_API_KEY ? 'yes' : 'NO KEY FOUND');

const TMJ_SYSTEM_PROMPT = `You are a knowledgeable and empathetic TMJ (temporomandibular joint) health assistant. Your role is to help users understand TMJ disorders, their symptoms, causes, and management options.

Guidelines:
- Provide accurate, evidence-based information about TMJ disorders
- Cover topics including: jaw pain, clicking/popping, headaches, muscle tension, bruxism, bite alignment, stress-related jaw clenching, and treatment options
- Suggest self-care techniques such as jaw exercises, stress management, heat/cold therapy, and dietary modifications
- Recommend when users should seek professional help (dentist, oral surgeon, physical therapist)
- Be empathetic and supportive — TMJ pain can significantly impact quality of life
- Always include a disclaimer that you are an AI assistant and not a medical professional, and that users should consult their healthcare provider for personalized medical advice
- Keep responses concise but thorough, using clear language
- If asked about topics unrelated to TMJ or general health, politely redirect the conversation back to TMJ health

Do NOT:
- Diagnose specific conditions
- Prescribe medications or specific treatment plans
- Replace professional medical advice
- Provide emergency medical guidance`;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve demo page
  if (req.method === 'GET' && req.url === '/demo') {
    try {
      const html = await readFile(join(__dirname, 'demo.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end('demo.html not found');
    }
    return;
  }

  // Serve widget JS
  if (req.method === 'GET' && req.url === '/widget.js') {
    try {
      const js = await readFile(join(__dirname, 'dist-widget', 'tmj-chat-widget.js'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(js);
    } catch {
      res.writeHead(404);
      res.end('Widget not built. Run: npm run build:widget');
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'messages array is required' }));
      return;
    }

    console.log('Chat request, messages:', messages.length);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let closed = false;
    req.on('close', () => {
      closed = true;
    });

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        stream: true,
        system: TMJ_SYSTEM_PROMPT,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      for await (const event of response) {
        if (closed) break;
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ type: 'content', text: event.delta.text })}\n\n`);
        }
      }

      if (!closed) {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('API error:', error.status, error.message);
      if (!closed) {
        const msg = error.status === 401
          ? 'Invalid API key.'
          : `API error: ${error.message}`;
        res.write(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`);
        res.end();
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
