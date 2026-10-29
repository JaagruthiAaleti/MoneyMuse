import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// AI Money Coach Endpoint
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  const { message, conversationHistory = [], financialContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini API is configured on server, use gemini-3.8-flash
  if (aiClient && geminiApiKey) {
    try {
      const systemInstruction = `
You are "MoneyMuse AI Financial Coach", a sophisticated, encouraging, and highly analytical personal finance assistant built into the MoneyMuse application.

Your Core Rules:
1. Ground your answers strictly in the provided financial context (user's real transactions, balances, budgets, categories, and savings goals).
2. Distinguish clearly between observed facts (e.g. "You spent ₹14,200 on Dining") and practical recommendations or projections.
3. Be encouraging, concise, non-judgmental, and pragmatic. Never give generic platitudes; refer to specific figures and category percentages from their data.
4. Format your responses with clean Markdown: use bolding for amounts, bullet points for recommendations, and concise paragraphs.
5. Do NOT claim you modified their accounts or created transactions.
6. Do NOT present yourself as a certified financial advisor or legal counsel.
7. If data is missing or incomplete for a query, politely explain what information is needed.
8. Currency is: ${financialContext?.currency || 'INR (₹)'}. Always format amounts in this currency.
      `;

      const prompt = `
CURRENT FINANCIAL CONTEXT:
${JSON.stringify(financialContext || {}, null, 2)}

PREVIOUS CONVERSATION:
${conversationHistory
  .slice(-6)
  .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
  .join('\n')}

USER QUERY:
${message}

Please provide your thoughtful, numbers-grounded financial advice:
      `;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I've analyzed your finances. Could you clarify which specific area you'd like to dive into?";
      return res.json({ reply: responseText, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.error('Gemini generation error, falling back to deterministic analysis:', err);
      // Fall through to deterministic financial insights
    }
  }

  // Deterministic Rule-Based Fallback when Gemini is unavailable or not configured
  const ctx = financialContext || {};
  const currency = ctx.currencySymbol || '₹';
  const totalIncome = ctx.totalIncome || 0;
  const totalExpenses = ctx.totalExpenses || 0;
  const savingsRate = ctx.savingsRate || 0;
  const topCategories = ctx.topCategories || [];
  const overBudgetCategories = ctx.overBudgetCategories || [];
  const goals = ctx.savingsGoals || [];

  let fallbackReply = `Here is my analysis of your finances:\n\n`;

  const lower = message.toLowerCase();
  if (lower.includes('where') || lower.includes('spend') || lower.includes('most') || lower.includes('category')) {
    if (topCategories.length > 0) {
      fallbackReply += `### Top Spending Categories This Period:\n`;
      topCategories.slice(0, 3).forEach((cat: any, idx: number) => {
        fallbackReply += `${idx + 1}. **${cat.name}**: ${currency}${Number(cat.amount).toLocaleString()} (${cat.percentage}% of total expenses)\n`;
      });
      fallbackReply += `\nYour total expenses stand at **${currency}${Number(totalExpenses).toLocaleString()}**. `;
      if (topCategories[0]?.percentage > 35) {
        fallbackReply += `Notice that ${topCategories[0].name} accounts for more than a third of your spending. Trimming this category by 10-15% could unlock significant monthly savings.`;
      }
    } else {
      fallbackReply += `You haven't logged any expenses in this period yet. Once you record transactions, I will analyze your top expense categories!`;
    }
  } else if (lower.includes('budget') || lower.includes('limit') || lower.includes('overspending')) {
    if (overBudgetCategories.length > 0) {
      fallbackReply += `### Budget Status:\n`;
      fallbackReply += `You have **${overBudgetCategories.length} categories** near or over their limits:\n`;
      overBudgetCategories.forEach((b: any) => {
        fallbackReply += `- **${b.name}**: ${currency}${Number(b.spent).toLocaleString()} spent of ${currency}${Number(b.limit).toLocaleString()} limit (${b.percentUsed}% used)\n`;
      });
      fallbackReply += `\nConsider pausing non-essential purchases in these areas for the remainder of this cycle.`;
    } else {
      fallbackReply += `### Budget Status:\n`;
      fallbackReply += `Excellent work! None of your active category budgets have exceeded their thresholds for this period. You are pacing well within your designated spending caps.`;
    }
  } else if (lower.includes('goal') || lower.includes('saving') || lower.includes('save')) {
    fallbackReply += `### Savings & Wealth Building:\n`;
    fallbackReply += `Your current savings rate is **${savingsRate}%** (Net saved: **${currency}${Number(totalIncome - totalExpenses).toLocaleString()}**).\n\n`;
    if (goals.length > 0) {
      fallbackReply += `**Active Goals:**\n`;
      goals.forEach((g: any) => {
        fallbackReply += `- **${g.name}**: ${currency}${Number(g.currentAmount).toLocaleString()} / ${currency}${Number(g.targetAmount).toLocaleString()} (${Math.round((g.currentAmount / g.targetAmount) * 100)}% achieved)\n`;
      });
    } else {
      fallbackReply += `Tip: Setting up a dedicated emergency fund or vacation goal helps you allocate excess cash flow systematically.`;
    }
  } else {
    fallbackReply += `### Financial Overview:\n`;
    fallbackReply += `- **Total Earned:** ${currency}${Number(totalIncome).toLocaleString()}\n`;
    fallbackReply += `- **Total Spent:** ${currency}${Number(totalExpenses).toLocaleString()}\n`;
    fallbackReply += `- **Savings Rate:** ${savingsRate}%\n\n`;
    fallbackReply += `**Proactive Tip:** To maximize financial freedom, aim for the 50/30/20 rule: 50% for needs, 30% for wants, and at least 20% dedicated to savings and investments. Feel free to ask me about category breakdowns, budgeting tips, or reaching your savings milestones!`;
  }

  return res.json({
    reply: fallbackReply,
    source: 'deterministic-rules',
    note: aiClient ? undefined : 'Running in offline financial intelligence mode.',
  });
});

// App configuration and API key status (never exposes key value)
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    hasGeminiKey: Boolean(geminiApiKey),
    model: 'gemini-3.8-flash',
    mode: geminiApiKey ? 'live-gemini' : 'built-in-intelligence',
  });
});

// Server setup with Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoneyMuse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
