RUN 
Nimport express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from 'google-generativeai';
import { CohereClient } from 'cohere-ai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.MCP_PORT || 3001;

// ────────────────────────────────────────────────────────────────────────
// LLM PROVIDERS INITIALIZATION
// ────────────────────────────────────────────────────────────────────────

const llmProviders = {
  openai: process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null,
  anthropic: process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null,
  google: process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null,
  cohere: process.env.COHERE_API_KEY ? new CohereClient({ token: process.env.COHERE_API_KEY }) : null,
};

const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';

// ────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ────────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    providers: {
      openai: !!llmProviders.openai,
      anthropic: !!llmProviders.anthropic,
      google: !!llmProviders.google,
      cohere: !!llmProviders.cohere,
      ollama: true, // Will be verified on first use
    },
  };
  res.json(status);
});

// ────────────────────────────────────────────────────────────────────────
// OLLAMA - LOCAL LLM ENDPOINT
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/ollama/generate', async (req, res) => {
  try {
    const { prompt, model = process.env.OLLAMA_MODEL || 'llama2', stream = false } = req.body;

    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model,
      prompt,
      stream: false,
    });

    res.json({
      provider: 'ollama',
      model,
      response: response.data.response,
      tokens: response.data.eval_count,
      time_ms: response.data.total_duration / 1000000,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, provider: 'ollama' });
  }
});

// ────────────────────────────────────────────────────────────────────────
// OPENAI - GPT MODELS
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/openai/chat', async (req, res) => {
  try {
    if (!llmProviders.openai) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const { messages, model = process.env.OPENAI_MODEL || 'gpt-4-turbo', temperature = 0.7 } = req.body;

    const response = await llmProviders.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 2000,
    });

    res.json({
      provider: 'openai',
      model,
      response: response.choices[0].message.content,
      tokens: response.usage.total_tokens,
      finish_reason: response.choices[0].finish_reason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, provider: 'openai' });
  }
});

// ────────────────────────────────────────────────────────────────────────
// ANTHROPIC - CLAUDE MODELS
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/anthropic/message', async (req, res) => {
  try {
    if (!llmProviders.anthropic) {
      return res.status(400).json({ error: 'Anthropic API key not configured' });
    }

    const { messages, model = process.env.ANTHROPIC_MODEL || 'claude-3-opus', max_tokens = 2000 } = req.body;

    const response = await llmProviders.anthropic.messages.create({
      model,
      max_tokens,
      messages,
    });

    res.json({
      provider: 'anthropic',
      model,
      response: response.content[0].text,
      tokens: response.usage.input_tokens + response.usage.output_tokens,
      stop_reason: response.stop_reason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, provider: 'anthropic' });
  }
});

// ────────────────────────────────────────────────────────────────────────
// GOOGLE - GEMINI MODELS
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/google/generate', async (req, res) => {
  try {
    if (!llmProviders.google) {
      return res.status(400).json({ error: 'Google API key not configured' });
    }

    const { prompt, model = process.env.GOOGLE_MODEL || 'gemini-pro' } = req.body;

    const genAI = llmProviders.google;
    const textModel = genAI.getGenerativeModel({ model });

    const result = await textModel.generateContent(prompt);
    const response = result.response.text();

    res.json({
      provider: 'google',
      model,
      response,
      finish_reason: result.response.candidates[0].finishReason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, provider: 'google' });
  }
});

// ────────────────────────────────────────────────────────────────────────
// COHERE - COMMAND MODELS
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/cohere/generate', async (req, res) => {
  try {
    if (!llmProviders.cohere) {
      return res.status(400).json({ error: 'Cohere API key not configured' });
    }

    const { prompt, model = process.env.COHERE_MODEL || 'command-r-plus' } = req.body;

    const response = await llmProviders.cohere.generate({
      model,
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    res.json({
      provider: 'cohere',
      model,
      response: response.generations[0].text,
      finish_reason: response.generations[0].finishReason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, provider: 'cohere' });
  }
});

// ────────────────────────────────────────────────────────────────────────
// UNIFIED LLM INTERFACE (Auto-select best provider)
// ────────────────────────────────────────────────────────────────────────

app.post('/llm/generate', async (req, res) => {
  try {
    const { prompt, task = 'general', preferredProvider = null } = req.body;

    let provider = preferredProvider;
    if (!provider) {
      // Auto-select based on task type
      if (task === 'local') {
        provider = 'ollama';
      } else if (task === 'code' || task === 'complex') {
        provider = llmProviders.openai ? 'openai' : llmProviders.anthropic ? 'anthropic' : 'ollama';
      } else {
        provider = 'ollama'; // Default to local for cost savings
      }
    }

    let response;
    switch (provider) {
      case 'openai':
        response = await axios.post('http://localhost:3001/llm/openai/chat', {
          messages: [{ role: 'user', content: prompt }],
        });
        break;
      case 'anthropic':
        response = await axios.post('http://localhost:3001/llm/anthropic/message', {
          messages: [{ role: 'user', content: prompt }],
        });
        break;
      case 'google':
        response = await axios.post('http://localhost:3001/llm/google/generate', { prompt });
        break;
      case 'cohere':
        response = await axios.post('http://localhost:3001/llm/cohere/generate', { prompt });
        break;
      case 'ollama':
      default:
        response = await axios.post('http://localhost:3001/llm/ollama/generate', { prompt });
    }

    res.json({
      ...response.data,
      autoSelected: !preferredProvider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────
// EMBEDDINGS - FOR SEMANTIC SEARCH & RAG
// ────────────────────────────────────────────────────────────────────────

app.post('/embeddings/generate', async (req, res) => {
  try {
    const { text, provider = 'openai' } = req.body;

    let embedding;
    switch (provider) {
      case 'openai':
        if (!llmProviders.openai) {
          return res.status(400).json({ error: 'OpenAI API key not configured' });
        }
        const response = await llmProviders.openai.embeddings.create({
          model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: text,
        });
        embedding = response.data[0].embedding;
        break;
      case 'ollama':
        const ollamaResponse = await axios.post(`${ollamaUrl}/api/embeddings`, {
          model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
          prompt: text,
        });
        embedding = ollamaResponse.data.embedding;
        break;
      default:
        return res.status(400).json({ error: 'Provider not supported for embeddings' });
    }

    res.json({
      provider,
      embedding,
      dimension: embedding.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────
// VECTOR DATABASE (QDRANT) - FOR RAG & SEMANTIC SEARCH
// ────────────────────────────────────────────────────────────────────────

app.post('/qdrant/store', async (req, res) => {
  try {
    const { collection, documents, embeddingsProvider = 'openai' } = req.body;

    const points = await Promise.all(
      documents.map(async (doc) => {
        const embResponse = await axios.post('http://localhost:3001/embeddings/generate', {
          text: doc.content,
          provider: embeddingsProvider,
        });

        return {
          id: uuidv4(),
          vector: embResponse.data.embedding,
          payload: {
            content: doc.content,
            metadata: doc.metadata || {},
            timestamp: new Date().toISOString(),
          },
        };
      })
    );

    // Upsert to Qdrant
    await axios.put(`${qdrantUrl}/collections/${collection}/points?wait=true`, {
      points,
    });

    res.json({ success: true, count: points.length, collection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/qdrant/search', async (req, res) => {
  try {
    const { collection, query, limit = 10, embeddingsProvider = 'openai' } = req.body;

    const embResponse = await axios.post('http://localhost:3001/embeddings/generate', {
      text: query,
      provider: embeddingsProvider,
    });

    const searchResponse = await axios.post(`${qdrantUrl}/collections/${collection}/points/search`, {
      vector: embResponse.data.embedding,
      limit,
      with_payload: true,
    });

    res.json({
      results: searchResponse.data.result,
      query,
      provider: embeddingsProvider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────
// AGENTS & WORKFLOWS
// ────────────────────────────────────────────────────────────────────────

app.post('/agent/execute', async (req, res) => {
  try {
    const { task, context = {}, model = 'auto' } = req.body;
    const agentId = uuidv4();

    // Send task to backend for processing
    const backendResponse = await axios.post('http://gobernador-backend:8080/api/agent-task', {
      agentId,
      task,
      context,
      model,
    });

    res.json({
      agentId,
      status: 'executing',
      result: backendResponse.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────
// LIST ALL AVAILABLE MODELS
// ────────────────────────────────────────────────────────────────────────

app.get('/models', async (req, res) => {
  try {
    const models = {
      openai: process.env.OPENAI_API_KEY ? ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] : [],
      anthropic: process.env.ANTHROPIC_API_KEY ? ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] : [],
      google: process.env.GOOGLE_API_KEY ? ['gemini-pro'] : [],
      cohere: process.env.COHERE_API_KEY ? ['command-r-plus', 'command-r'] : [],
      ollama: [],
    };

    // Get Ollama models
    try {
      const ollamaModels = await axios.get(`${ollamaUrl}/api/tags`);
      models.ollama = ollamaModels.data.models.map((m) => m.name);
    } catch (e) {
      // Ollama not available
    }

    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────
// SERVER START
// ────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🤖 MCP Server Running                                ║
║  Port: ${PORT}                                              
║  Ollama: ${ollamaUrl}
║  Qdrant: ${qdrantUrl}
╚═══════════════════════════════════════════════════════╝

Available Endpoints:
  POST /llm/generate - Auto-select best LLM
  POST /llm/openai/chat - OpenAI GPT models
  POST /llm/anthropic/message - Claude models
  POST /llm/google/generate - Gemini models
  POST /llm/cohere/generate - Cohere models
  POST /llm/ollama/generate - Local Ollama
  POST /embeddings/generate - Generate embeddings
  POST /qdrant/store - Store documents in vector DB
  POST /qdrant/search - Semantic search
  POST /agent/execute - Execute AI agent tasks
  GET  /models - List available models
  GET  /health - Health check

Supported Providers:
  ✓ OpenAI (${llmProviders.openai ? 'configured' : 'not configured'})
  ✓ Anthropic (${llmProviders.anthropic ? 'configured' : 'not configured'})
  ✓ Google (${llmProviders.google ? 'configured' : 'not configured'})
  ✓ Cohere (${llmProviders.cohere ? 'configured' : 'not configured'})
  ✓ Local Ollama (ready)
`);
});
