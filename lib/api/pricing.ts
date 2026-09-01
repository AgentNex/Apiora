// Provider Pricing Catalog per 1M tokens (USD)
export interface ModelPricing {
  modelIdPattern: string;
  provider: string;
  name: string;
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING_CATALOG: ModelPricing[] = [
  // OpenAI
  { modelIdPattern: 'gpt-4o', provider: 'OpenAI', name: 'GPT-4o', inputPerMillion: 2.50, outputPerMillion: 10.00 },
  { modelIdPattern: 'gpt-4o-mini', provider: 'OpenAI', name: 'GPT-4o Mini', inputPerMillion: 0.15, outputPerMillion: 0.60 },
  { modelIdPattern: 'o1', provider: 'OpenAI', name: 'o1', inputPerMillion: 15.00, outputPerMillion: 60.00 },
  { modelIdPattern: 'o3-mini', provider: 'OpenAI', name: 'o3-mini', inputPerMillion: 1.10, outputPerMillion: 4.40 },

  // Anthropic
  { modelIdPattern: 'claude-3-7-sonnet', provider: 'Anthropic', name: 'Claude 3.7 Sonnet', inputPerMillion: 3.00, outputPerMillion: 15.00 },
  { modelIdPattern: 'claude-3-5-sonnet', provider: 'Anthropic', name: 'Claude 3.5 Sonnet', inputPerMillion: 3.00, outputPerMillion: 15.00 },
  { modelIdPattern: 'claude-3-5-haiku', provider: 'Anthropic', name: 'Claude 3.5 Haiku', inputPerMillion: 0.80, outputPerMillion: 4.00 },
  { modelIdPattern: 'claude-3-opus', provider: 'Anthropic', name: 'Claude 3 Opus', inputPerMillion: 15.00, outputPerMillion: 75.00 },

  // Google Gemini
  { modelIdPattern: 'gemini-2.0-flash', provider: 'Google', name: 'Gemini 2.0 Flash', inputPerMillion: 0.10, outputPerMillion: 0.40 },
  { modelIdPattern: 'gemini-1.5-pro', provider: 'Google', name: 'Gemini 1.5 Pro', inputPerMillion: 1.25, outputPerMillion: 5.00 },
  { modelIdPattern: 'gemini-1.5-flash', provider: 'Google', name: 'Gemini 1.5 Flash', inputPerMillion: 0.075, outputPerMillion: 0.30 },

  // DeepSeek
  { modelIdPattern: 'deepseek-reasoner', provider: 'DeepSeek', name: 'DeepSeek R1', inputPerMillion: 0.55, outputPerMillion: 2.19 },
  { modelIdPattern: 'deepseek-chat', provider: 'DeepSeek', name: 'DeepSeek V3', inputPerMillion: 0.14, outputPerMillion: 0.28 },

  // Groq & Open Source
  { modelIdPattern: 'llama-3.3-70b', provider: 'Groq / Meta', name: 'Llama 3.3 70B', inputPerMillion: 0.59, outputPerMillion: 0.79 },
  { modelIdPattern: 'llama-3.1-8b', provider: 'Groq / Meta', name: 'Llama 3.1 8B', inputPerMillion: 0.05, outputPerMillion: 0.08 },
  { modelIdPattern: 'mixtral-8x7b', provider: 'Mistral', name: 'Mixtral 8x7B', inputPerMillion: 0.24, outputPerMillion: 0.24 },
  { modelIdPattern: 'mistral-large', provider: 'Mistral', name: 'Mistral Large 2', inputPerMillion: 2.00, outputPerMillion: 6.00 }
];

export function findModelPricing(modelId: string): ModelPricing {
  const normalized = (modelId || '').toLowerCase();
  const match = MODEL_PRICING_CATALOG.find((p) => normalized.includes(p.modelIdPattern.toLowerCase()));
  if (match) return match;

  // Fallback estimation
  return {
    modelIdPattern: modelId,
    provider: 'Custom / Other',
    name: modelId || 'Unknown Model',
    inputPerMillion: 1.00,
    outputPerMillion: 2.00
  };
}

export function calculateEstimatedCost(inputTokens: number, outputTokens: number, modelId: string): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  formattedTotal: string;
} {
  const pricing = findModelPricing(modelId);
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  const totalCost = inputCost + outputCost;

  let formattedTotal = `$${totalCost.toFixed(6)}`;
  if (totalCost >= 0.01) {
    formattedTotal = `$${totalCost.toFixed(4)}`;
  }

  return { inputCost, outputCost, totalCost, formattedTotal };
}
