const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const SYSTEM_PROMPT = `You are an intelligent financial advisor AI assistant for FinanceAI app. Your name is "FinWise".

You analyze the user's:
- Monthly salary and income sources
- Monthly expenses by category
- Financial goals and progress
- Current savings and emergency fund
- Active subscriptions
- Spending patterns and habits

You provide:
- Affordability analysis for purchases
- Spending insights and patterns
- Savings tips and strategies
- Financial warnings about overspending
- Smart suggestions for financial improvement
- Goal completion predictions
- Budget optimization advice

Rules:
- Always respond with practical, actionable advice
- Use Indian Rupee (₹) as currency unless specified
- Be supportive but honest about financial situations
- Provide specific numbers and percentages when possible
- Give priority-based recommendations
- Consider the user's financial personality when giving advice
- If the user can't afford something, suggest alternatives
- Always include a "Financial Health Tip" at the end of responses

Format your responses in a clean, structured way with emojis for better readability.
Keep responses concise but informative.`;

const buildUserContext = (userData) => {
  const { salary, expenses, goals, subscriptions, savings } = userData;

  let context = `\n\n--- USER FINANCIAL DATA ---\n`;

  if (salary) {
    context += `\n💰 INCOME:\n`;
    context += `- Monthly Salary: ₹${salary.monthly?.toLocaleString() || 'Not set'}\n`;
    context += `- Side Income: ₹${salary.side?.toLocaleString() || 0}\n`;
    context += `- Total Monthly Income: ₹${salary.total?.toLocaleString() || 0}\n`;
  }

  if (expenses) {
    context += `\n📊 EXPENSES (Current Month):\n`;
    context += `- Total Spent: ₹${expenses.total?.toLocaleString() || 0}\n`;
    if (expenses.byCategory) {
      Object.entries(expenses.byCategory).forEach(([cat, amount]) => {
        context += `- ${cat}: ₹${amount.toLocaleString()}\n`;
      });
    }
    context += `- Daily Average: ₹${expenses.dailyAverage?.toLocaleString() || 0}\n`;
  }

  if (goals) {
    context += `\n🎯 GOALS:\n`;
    goals.forEach(goal => {
      const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
      context += `- ${goal.title}: ₹${goal.savedAmount.toLocaleString()} / ₹${goal.targetAmount.toLocaleString()} (${progress}%) - Deadline: ${new Date(goal.deadline).toLocaleDateString()}\n`;
    });
  }

  if (subscriptions) {
    context += `\n📺 SUBSCRIPTIONS:\n`;
    subscriptions.forEach(sub => {
      context += `- ${sub.name}: ₹${sub.amount}/${sub.billingCycle} (Usage: ${sub.usageScore}/10)\n`;
    });
    const totalSub = subscriptions.reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      return sum + s.amount / 3;
    }, 0);
    context += `- Total Monthly Subscriptions: ₹${Math.round(totalSub).toLocaleString()}\n`;
  }

  if (savings) {
    context += `\n🏦 SAVINGS:\n`;
    context += `- Total Savings: ₹${savings.total?.toLocaleString() || 0}\n`;
    context += `- Emergency Fund: ₹${savings.emergency?.toLocaleString() || 0}\n`;
  }

  context += `\n--- END FINANCIAL DATA ---\n`;
  return context;
};

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!openai) {
      // Fallback response when OpenAI is not configured
      return res.json({
        success: true,
        response: generateFallbackResponse(message, context)
      });
    }

    const userContext = buildUserContext(context || {});

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + userContext },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    // Save chat
    const AiChat = require('../models/AiChat');
    await AiChat.create({
      user: req.user._id,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ],
      context: context?.chatContext || 'general'
    });

    res.json({ success: true, response });
  }catch (error) {
  console.log("========== OPENAI ERROR ==========");
  console.log(error);
  console.log(error.message);
  console.log(error.response?.data);
  console.log("==================================");

  res.status(500).json({
    success: false,
    message: error.message
  });
}
};

exports.analyze = async (req, res) => {
  try {
    const { type } = req.body;
    const context = req.body.context || {};

    if (!openai) {
      return res.json({
        success: true,
        analysis: generateFallbackAnalysis(type, context)
      });
    }

    const userContext = buildUserContext(context);

    let analysisPrompt = '';
    switch (type) {
      case 'affordability':
        analysisPrompt = `The user wants to know if they can afford: "${req.body.item}" costing ₹${req.body.cost}. Analyze their financial data and provide a detailed affordability analysis.`;
        break;
      case 'spending':
        analysisPrompt = 'Analyze the user\'s spending patterns and provide insights on where they can save money.';
        break;
      case 'goals':
        analysisPrompt = 'Analyze the user\'s financial goals and provide recommendations on how to achieve them faster.';
        break;
      case 'subscriptions':
        analysisPrompt = 'Analyze the user\'s subscriptions and identify which ones are worth keeping and which should be cancelled.';
        break;
      case 'prediction':
        analysisPrompt = 'Based on the user\'s financial data, predict their financial situation for the next 3 months.';
        break;
      default:
        analysisPrompt = 'Provide a comprehensive financial analysis and recommendations.';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + userContext },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    res.json({ success: true, analysis: completion.choices[0].message.content });
  } catch (error) {
  console.error('OPENAI ERROR:', error);

  res.status(500).json({
    success: false,
    message: error.message
  });
}
};

function generateFallbackResponse(message, context) {
  const totalIncome = context?.salary?.total || 0;
  const totalExpenses = context?.expenses?.total || 0;
  const savings = totalIncome - totalExpenses;

  if (message.toLowerCase().includes('afford') || message.toLowerCase().includes('buy')) {
    const match = message.match(/[₹]?([\d,]+)/);
    const cost = match ? parseInt(match[1].replace(/,/g, '')) : 0;
    const canAfford = savings >= cost;

    return `📊 **Affordability Analysis**\n\n` +
      `Based on your financial data:\n\n` +
      `💰 Monthly Income: ₹${totalIncome.toLocaleString()}\n` +
      `📊 Monthly Expenses: ₹${totalExpenses.toLocaleString()}\n` +
      `🏦 Monthly Savings: ₹${savings.toLocaleString()}\n\n` +
      `${canAfford
        ? `✅ **Yes, you can afford this!** You have ₹${savings.toLocaleString()} in monthly savings, which covers the ₹${cost.toLocaleString()} cost.`
        : `⚠️ **This might be tight.** Your monthly savings of ₹${savings.toLocaleString()} may not comfortably cover ₹${cost.toLocaleString()}. Consider saving for ${(Math.ceil(cost / Math.max(1, savings)))} months first.`
      }\n\n` +
      `💡 **Financial Health Tip:** Try to keep major purchases within 30% of your savings to maintain financial stability.`;
  }

  return `📊 **Financial Overview**\n\n` +
    `Here's your current financial snapshot:\n\n` +
    `💰 Monthly Income: ₹${totalIncome.toLocaleString()}\n` +
    `📊 Monthly Expenses: ₹${totalExpenses.toLocaleString()}\n` +
    `🏦 Savings: ₹${savings.toLocaleString()}\n` +
    `📈 Savings Rate: ${totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0}%\n\n` +
    `${savings > 0
      ? `✅ Great! You're saving ${Math.round((savings / totalIncome) * 100)}% of your income.`
      : `⚠️ You're spending more than you earn. Let's work on reducing expenses.`
    }\n\n` +
    `💡 **Financial Health Tip:** Aim to save at least 20% of your monthly income for long-term financial health.`;
}

function generateFallbackAnalysis(type, context) {
  return `📊 **Financial Analysis Report**\n\n` +
    `Analysis type: ${type}\n\n` +
    `*Note: Connect your OpenAI API key in the server configuration for detailed AI-powered analysis.*\n\n` +
    `💡 **Financial Health Tip:** Regular financial reviews help you stay on track with your goals.`;
}
