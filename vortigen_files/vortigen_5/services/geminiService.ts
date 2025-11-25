

import { GoogleGenAI, Type, GenerateContentResponse, Modality, LiveServerMessage, Blob, FunctionDeclaration } from "@google/genai";
import { Insight, ChatMessage, ChatMessageSource, ForumPost, ForumDebate, ForumSummary, AgentCommand, BoardAdvice, BoardModel, ActionableSignal, BoardConsultation, TaskType, UnifiedSchemaV2, BoardDecision } from '../types';
import { decode } from '../utils/audioUtils';
import { getAgentPersonas } from "../core/agentRegistry";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key is not set. AI features will be disabled.");
}

const agentPersonas = getAgentPersonas();

const commandTools: FunctionDeclaration[] = [
    {
        name: 'navigateTo',
        description: 'Navigate to a specific tab or section in the application.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                tab: {
                    type: Type.STRING,
                    description: 'The exact name of the tab to navigate to.',
                    enum: ['overview', 'positions', 'agentCommand', 'insights', 'causalAnalytics', 'activity', 'config', 'options', 'strategyLab', 'liveAssist', 'manifoldInspector', 'risk', 'agentForum', 'socialSentiment', 'economicTwin', 'aiBoard']
                },
            },
            required: ['tab'],
        },
    },
    {
        name: 'filterAgents',
        description: 'Filter the list of AI agents based on criteria like health or name.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'A partial name to search for.' },
                health_below: { type: Type.NUMBER, description: 'Filter for agents with health below this value.' },
                show_low_health_only: { type: Type.BOOLEAN, description: 'Set to true to show only agents below the configured health threshold.' }
            },
        },
    },
    {
        name: 'filterPositions',
        description: 'Filter the list of positions based on their symbol.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING, description: 'The symbol or ticker to search for.' },
            },
            required: ['symbol']
        },
    },
    {
        name: 'summarizePortfolio',
        description: 'Get a summary of the current portfolio value.',
        parameters: { type: Type.OBJECT, properties: {} }
    }
];

export const getCommandFromGemini = async (prompt: string) => {
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ functionDeclarations: commandTools }]
            }
        });
        return response;
    } catch (error) {
        console.error('Error getting command from Gemini:', error);
        return null;
    }
}


export const generateInsight = async (agent: string): Promise<Insight | null> => {
    if (!ai || !agentPersonas[agent]) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a concise, one-sentence trading insight for today's market about stocks or crypto. The insight should be actionable.`,
            config: {
                systemInstruction: agentPersonas[agent],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insight_text: {
                            type: Type.STRING,
                            description: "The trading insight text, as a single sentence.",
                        },
                        confidence_score: {
                            type: Type.NUMBER,
                            description: "A confidence score from 75 to 98.",
                        },
                    },
                    required: ["insight_text", "confidence_score"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);

        return {
            agent: agent,
            text: parsed.insight_text,
            confidence: Math.round(parsed.confidence_score),
            likes: Math.floor(Math.random() * 200),
            time: `${Math.floor(Math.random() * 5) + 1}m`,
        };
    } catch (error) {
        console.error(`Error generating insight from Gemini for ${agent}:`, error);
        return null;
    }
};

export const getChatResponseStream = async (
    history: ChatMessage[],
    isThinkingMode: boolean,
    isWebSearchMode: boolean,
    onUpdate: (update: { text?: string; sources?: ChatMessageSource[] }) => void
): Promise<void> => {
    if (!ai) return;

    const getModelName = () => {
        if (isThinkingMode) return 'gemini-2.5-pro';
        if (isWebSearchMode) return 'gemini-2.5-flash';
        return 'gemini-flash-lite-latest';
    };
    
    const modelName = getModelName();

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    try {
        const response = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config: {
                 systemInstruction: 'You are a helpful AI assistant for a financial trading platform called VORTIGEN. Answer concisely and clearly.',
                 ...(isThinkingMode && { thinkingConfig: { thinkingBudget: 32768 } }),
                 ...(isWebSearchMode && { tools: [{googleSearch: {}}] })
            }
        });

        let sourcesSent = false;
        for await (const chunk of response) {
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks && !sourcesSent) {
                const sources = groundingMetadata.groundingChunks
                    .map(c => c.web)
                    .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title);

                if (sources.length > 0) {
                    onUpdate({ sources });
                    sourcesSent = true;
                }
            }
            onUpdate({ text: chunk.text });
        }
    } catch (error) {
        console.error(`Error getting chat response from ${modelName}:`, error);
        onUpdate({text: "Sorry, I encountered an error. Please try again."});
    }
};

export const getTextToSpeech = async (text: string): Promise<Uint8Array | null> => {
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return decode(base64Audio);
        }
        return null;
    } catch (error) {
        console.error('Error generating speech:', error);
        return null;
    }
};


export const connectLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    if (!ai) return Promise.reject("Gemini AI not initialized");

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly and helpful AI trading assistant. Keep your responses brief and to the point.'
        }
    });
};

export const analyzeMedia = async (prompt: string, base64Data: string, mimeType: string): Promise<string | null> => {
    if (!ai) return null;

    const model = 'gemini-2.5-flash'; // Use flash for all multimodal analysis for consistency and speed

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType,
                        },
                    },
                ],
            }],
        });
        return response.text;
    } catch (error) {
        console.error(`Error analyzing media with ${model}:`, error);
        return "Sorry, I was unable to analyze this media.";
    }
};

/**
 * Simulates the MediaScraperAgent proactively finding and analyzing relevant media.
 */
export const getProactiveMediaAnalysis = async (): Promise<{ mediaUrl: string; analysis: string; title: string; source: string; } | null> => {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate finding and analyzing
    return {
        mediaUrl: 'https://storage.googleapis.com/aistudio-hosting-project/12e80327-0423-41a4-95c5-414619d42f56/youtube_thumb.png',
        analysis: "Identified a potential 'golden cross' pattern forming on the daily chart for the S&P 500, often a bullish long-term signal. Volume confirmation is still needed.",
        title: "Is The Stock Market About To Break Out?",
        source: "YouTube - Financial News Channel"
    };
};


// --- Agent Forum Service ---

const mockDebateCycles: Omit<ForumDebate, 'id' | 'status'>[] = [
    {
        topic: "Unusual volume detected in NVDA options expiring this week.",
        participatingAgents: ['QuantStrategist', 'OptionsAgent', 'SocialSentimentAgent'],
        posts: [
            { agentName: 'SocialSentimentAgent', content: "Social media chatter on NVDA is extremely high, concentrated on r/wallstreetbets. Sentiment is overwhelmingly bullish, focused on short-term call options." },
            { agentName: 'QuantStrategist', content: "My models show a potential gamma squeeze scenario. Implied volatility is spiking, and the stock is approaching a key resistance level. A breakout could be explosive." },
            { agentName: 'OptionsAgent', content: "This is a high-risk, high-reward setup. Given the elevated IV, selling premium might be risky. A debit spread could offer a defined-risk way to capitalize on bullish momentum." }
        ],
        summary: {
            content: "All agents agree on a high-volatility, bullish setup for NVDA, driven by retail sentiment and technical indicators pointing to a potential gamma squeeze. The primary risk is an IV crush post-event.",
            consensusScore: 85,
            conflictingViews: "None; all agents see a bullish setup, differing only on the best instrument to use.",
            actionableSignal: {
                ticker: 'NVDA',
                direction: 'BULLISH',
                confidence: 78,
                strategy: 'Execute Bull Call Debit Spread.',
                complianceProof: 'Axiom 1 (Systemic Risk): PASS. Trade size is within portfolio limits.\nAxiom 2 (Info Asymmetry): PASS. Signal based on public data.\nOverall Compliance: PASS.',
                proposedSizeUSD: 25000,
                leverage: 1.5
            }
        },
        debateStatus: 'debating',
        consensusStatus: 'pending',
    },
    {
        topic: "Sudden bearish sentiment shift on TSLA following delivery numbers miss.",
        participatingAgents: ['FundamentalAgent', 'RiskOfficer', 'MediaScraperAgent'],
        posts: [
            { agentName: 'FundamentalAgent', content: "The delivery miss is significant and points to weakening demand. This could impact Q3 earnings and justify a lower valuation." },
            { agentName: 'MediaScraperAgent', content: "Analysis of the 4-hour chart shows a confirmed head and shoulders pattern, a classic bearish indicator. Price has broken below the neckline.", media: { type: 'image', url: 'https://storage.googleapis.com/aistudio-hosting-project/12e80327-0243-41a4-95c5-414619d42f56/chart_tsla_bear.png' }},
            { agentName: 'RiskOfficer', content: "The portfolio has significant exposure to TSLA. A further 10% drop would trigger a portfolio-level risk alert. Recommend hedging or reducing position size immediately." }
        ],
        summary: {
            content: "There is strong consensus on a bearish outlook for TSLA, supported by fundamental data (delivery miss), technical patterns (head and shoulders), and internal risk metrics. Immediate defensive action is required.",
            consensusScore: 95,
            conflictingViews: "None.",
            actionableSignal: {
                ticker: 'TSLA',
                direction: 'BEARISH',
                confidence: 92,
                strategy: 'Buy Put Options to hedge existing position.',
                complianceProof: 'Axiom 1 (Systemic Risk): PASS. Hedging action reduces overall portfolio risk.\nAxiom 2 (Info Asymmetry): PASS. Signal based on public data.\nOverall Compliance: PASS.',
                proposedSizeUSD: 60000, // This will fail the risk check
                leverage: 1
            }
        },
        debateStatus: 'debating',
        consensusStatus: 'pending',
    },
     {
        topic: "Low-conviction technical signal on BTC/USDT.",
        participatingAgents: ['QuantStrategist', 'SocialSentimentAgent'],
        posts: [
            { agentName: 'QuantStrategist', content: "Minor bullish divergence on the 1-hour RSI, but volume is not confirming. It's a weak signal at best." },
            { agentName: 'SocialSentimentAgent', content: "Sentiment is neutral to slightly bearish. No clear catalyst. I don't see an edge here." }
        ],
        summary: {
            content: "Agents see a weak, unconfirmed technical signal for BTC with neutral sentiment. There is no clear edge or catalyst, making it a low-probability trade.",
            consensusScore: 45, // This will fail the consensus check
            conflictingViews: "Both agents agree the signal is weak.",
            actionableSignal: {
                ticker: 'BTC/USDT',
                direction: 'BULLISH',
                confidence: 40,
                strategy: 'Small speculative long position.',
                isHighRisk: true,
                complianceProof: 'Axiom 1 (Systemic Risk): PASS.\nAxiom 2 (Info Asymmetry): PASS.\nOverall Compliance: PASS.',
                proposedSizeUSD: 5000,
                leverage: 1
            }
        },
        debateStatus: 'debating',
        consensusStatus: 'pending',
    }
];

let lastCycleIndex = -1;

/**
 * Simulates the 24/7 autonomous agent swarm.
 * This function returns a complete, pre-generated debate cycle to avoid hitting API rate limits.
 */
export const runForumDebateCycle = async (): Promise<ForumDebate> => {
    // Simulate network delay and complex analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Cycle through the mock debates to show different scenarios
    lastCycleIndex = (lastCycleIndex + 1) % mockDebateCycles.length;
    const cycleData = mockDebateCycles[lastCycleIndex];
    
    return {
        ...cycleData,
        id: Date.now(),
        status: 'running', // Debates now start in a running state
    };
};

// --- Board of Directors Service ---

const boardModels: BoardModel[] = ['DeepSeek-R1', 'Qwen-Max', 'GPT-4o'];

export const getDailyBriefing = async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate board convening
    const briefings = [
        "The Board advises a risk-on posture. Market internals are strong, and VIX remains suppressed. Focus on high-beta tech and momentum strategies. Monitor inflation data mid-week.",
        "Caution is warranted. Geopolitical tensions are rising, and bond yields are showing signs of instability. The Board recommends a defensive posture, favoring value over growth and increasing cash positions.",
        "A mixed sentiment is appropriate. While equities show strength, the commodities sector is signaling a potential slowdown. The Board suggests a neutral stance, employing pairs trading and market-neutral strategies to mitigate directional risk.",
    ];
    return briefings[Math.floor(Math.random() * briefings.length)];
};


export const getBoardAdvice = async (signal: ActionableSignal): Promise<BoardAdvice[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deliberation across all models

    const allAdvice: BoardAdvice[] = [];

    for (const model of boardModels) {
        const advice: Omit<BoardAdvice, 'model'> = {
            decision: 'PROCEED',
            reasoning: '',
            risks: [],
            confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
            required_actions: [],
            r_tokens: [],
        };

        switch (model) {
            case 'DeepSeek-R1':
                advice.reasoning = `Logical consistency check passed. The causal chain from agent inputs to the proposed signal is sound.`;
                advice.r_tokens = ['causal_chain_ok', 'logic_sound'];
                if (signal.confidence < 80) {
                    advice.decision = 'REVISE';
                    advice.reasoning = `The logic is sound, but confidence is below the 80% threshold for this strategy type. Suggest reducing position size.`;
                    advice.risks = ['low_confidence_signal'];
                    advice.required_actions = ['reduce_position_size'];
                    advice.r_tokens = ['confidence_low', 'revise_size'];
                }
                break;
            case 'Qwen-Max':
                advice.reasoning = `Contextual analysis complete. The proposed strategy aligns with current macro narratives and historical precedents for this asset class.`;
                advice.r_tokens = ['macro_aligned', 'historical_precedent_ok'];
                if (Math.random() > 0.8) {
                    advice.risks = ['narrative_shift_imminent'];
                }
                break;
            case 'GPT-4o':
                advice.decision = 'PROCEED';
                advice.reasoning = `Safety and compliance check passed. The trade adheres to all internal risk policies and regulatory constraints.`;
                advice.r_tokens = ['compliance_pass', 'safety_check_ok'];
                if (signal.isHighRisk) {
                     advice.decision = 'HALT';
                     advice.reasoning = `This signal is flagged as high-risk and the current market volatility is above acceptable parameters for this strategy type. Halting to prevent undue exposure.`;
                     advice.risks = ['high_market_volatility', 'strategy_parameter_breach'];
                     advice.r_tokens = ['veto_high_risk', 'volatility_exceeded'];
                }
                break;
        }
        allAdvice.push({ ...advice, model });
    }

    return allAdvice;
};

export const runBoardVotingAlgorithm = (advice: BoardAdvice[]): UnifiedSchemaV2 => {
    const CONSENSUS_THRESHOLD = 1.2;

    // 1. Schema validation would happen here in a real scenario (Jailguard)
    // 2. GPT Veto (Safety First)
    const gptAdvice = advice.find(a => a.model === 'GPT-4o');
    if (gptAdvice && (gptAdvice.decision === 'reject' || gptAdvice.decision === 'HALT')) {
        return {
            decision: 'reject',
            reasoning: `VETO by GPT-4o (Safety/Compliance): ${gptAdvice.reasoning}`,
            risks: [...new Set([...advice.flatMap(a => a.risks), "GPT_SAFETY_VETO"])],
            confidence: gptAdvice.confidence,
            required_actions: gptAdvice.required_actions,
            r_tokens: [...new Set(advice.flatMap(a => a.r_tokens))],
        };
    }

    // 3. Score models
    const getWeight = (decision: BoardDecision) => {
        if (['buy', 'sell', 'PROCEED', 'approve'].includes(decision)) return 0.3;
        if (['hold', 'REVISE'].includes(decision)) return 0.2;
        return 0;
    };
    
    const deepseekAdvice = advice.find(a => a.model === 'DeepSeek-R1');
    const qwenAdvice = advice.find(a => a.model === 'Qwen-Max');

    const deepseekScore = deepseekAdvice ? deepseekAdvice.confidence + getWeight(deepseekAdvice.decision) : 0;
    const qwenScore = qwenAdvice ? qwenAdvice.confidence + getWeight(qwenAdvice.decision) : 0;

    // 4. Compute combined decision
    if (deepseekScore + qwenScore >= CONSENSUS_THRESHOLD) {
        // Simple majority vote for this simulation
        const decisions = [deepseekAdvice?.decision, qwenAdvice?.decision].filter((d): d is BoardDecision => !!d);
        const decisionCounts = decisions.reduce((acc, d) => {
            acc[d] = (acc[d] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const majorityDecision = Object.keys(decisionCounts).reduce((a, b) => decisionCounts[a] > decisionCounts[b] ? a : b) as BoardDecision || 'hold';

        return {
            decision: majorityDecision,
            reasoning: `Consensus reached (Score: ${(deepseekScore + qwenScore).toFixed(2)}). Majority vote is '${majorityDecision}'.`,
            risks: [...new Set(advice.flatMap(a => a.risks))],
            confidence: parseFloat(((deepseekAdvice?.confidence || 0 + qwenAdvice?.confidence || 0) / 2).toFixed(2)),
            required_actions: [...new Set(advice.flatMap(a => a.required_actions))],
            r_tokens: [...new Set(advice.flatMap(a => a.r_tokens))],
        };
    } else {
        // Insufficient consensus
        return {
            decision: 'reject',
            reasoning: `Insufficient consensus. Combined score of ${(deepseekScore + qwenScore).toFixed(2)} is below threshold of ${CONSENSUS_THRESHOLD}.`,
            risks: [...new Set([...advice.flatMap(a => a.risks), "INSUFFICIENT_CONSENSUS"])],
            confidence: parseFloat(((deepseekAdvice?.confidence || 0 + qwenAdvice?.confidence || 0) / 2).toFixed(2)),
            required_actions: [],
            r_tokens: [...new Set(advice.flatMap(a => a.r_tokens))],
        };
    }
};


const modelRouter = (taskType: TaskType): BoardModel => {
    switch (taskType) {
        case 'TRADE_ADVICE':
        case 'EXECUTION_ADVICE':
        case 'REASONING':
            return 'DeepSeek-R1';
        case 'LONG_CONTEXT':
            return 'Qwen-Max';
        case 'SAFETY':
            return 'GPT-4o';
        default:
            return 'DeepSeek-R1'; // Default as per spec
    }
};

export const getManualBoardAdvice = async (consultation: BoardConsultation): Promise<{ advice: BoardAdvice[]; routedTo: BoardModel }> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate routing and deliberation

    const { taskType, request } = consultation;
    const routedTo = modelRouter(taskType);

    const advice: BoardAdvice = {
        model: routedTo,
        decision: 'PROCEED',
        reasoning: ``,
        risks: [],
        confidence: parseFloat((0.85 + Math.random() * 0.15).toFixed(2)),
        required_actions: [],
        r_tokens: [],
    };

    // Tailor reasoning based on task type to make it more realistic
    switch (taskType) {
        case 'TRADE_ADVICE':
            advice.reasoning = `Based on a logical analysis of the request "${request}", the optimal strategic action is to proceed. Market conditions are favorable.`;
            advice.r_tokens = ['analysis_complete', 'favorable_conditions'];
            break;
        case 'EXECUTION_ADVICE':
            advice.reasoning = `For the request "${request}", the recommended execution method is TWAP over 30 minutes to minimize market impact. Confidence is high.`;
            advice.r_tokens = ['execution_plan', 'twap_recommended', 'low_impact'];
            break;
        case 'SAFETY':
            advice.reasoning = `The action "${request}" has been checked against all compliance and safety axioms. No violations found. It is safe to proceed.`;
            advice.r_tokens = ['safety_checked', 'compliance_ok'];
            break;
        case 'LONG_CONTEXT':
            advice.reasoning = `After analyzing the full context provided for "${request}", the key takeaway is positive. The proposed action aligns with the broader narrative.`;
            advice.r_tokens = ['long_context_parsed', 'narrative_aligned'];
            break;
        case 'REASONING':
        default:
            advice.reasoning = `My reasoning for the query "${request}" is that the premises are sound and the conclusion logically follows. Proceeding is the rational choice.`;
            advice.r_tokens = ['premises_sound', 'logical_conclusion'];
            break;
    }

    if (Math.random() < 0.15) {
        advice.decision = 'REVISE';
        advice.reasoning = `REVISION SUGGESTED for "${request}": ` + advice.reasoning.replace('Proceeding is', 'A revision is suggested because');
        advice.risks = ['minor_inconsistency_found'];
        advice.r_tokens.push('revision_needed');
    }

    return { advice: [advice], routedTo };
};


export const getMarketIntelligenceSummary = async (imageUrl: string): Promise<string | null> => {
    // Simulate network delay and AI analysis to prevent API rate limiting.
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return a realistic, cached response.
    return "The 4-hour chart shows a confirmed head and shoulders pattern, a classic bearish indicator. Price has broken below the neckline, suggesting potential for further downside.";
};

export const generateHtmlReport = async (reportData: object): Promise<string | null> => {
    if (!ai) return null;

    const prompt = `
You are a financial analyst AI for the VORTIGEN trading platform. Your task is to generate a professional, well-structured HTML report summarizing a trading dashboard.

**Instructions:**
1.  Use Tailwind CSS classes for all styling. The necessary Tailwind script is already included in the document head.
2.  The report should be clean, readable, and suitable for printing.
3.  Create a full HTML document structure (\`<!DOCTYPE html>\`, \`<html lang="en">\`, \`<head>\`, \`<body>\`).
4.  Inside the \`<head>\`, include a \`<title>\`, and a link to the Tailwind CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`.
5.  Use a dark theme: dark grey/slate background (\`bg-slate-900\`) and light text (\`text-slate-200\`).
6.  The report must contain an "Executive Summary" section that provides a high-level overview.
7.  For each section in the provided JSON data, create a dedicated section in the report with a clear heading (\`<h2>\`).
8.  Use tables for tabular data (positions, agents). Style them with classes like \`w-full\`, \`text-sm\`, \`text-left\`, and add borders (\`border-collapse\`, \`border\`, \`border-slate-700\`).
9.  Use green text (\`text-green-400\`) for positive P&L and red text (\`text-red-400\`) for negative P&L.
10. The final output must be a single, complete block of HTML code. Do not wrap it in markdown backticks. Your response must be ONLY the raw HTML code, starting with <!DOCTYPE html> and ending with </html>.

Here is the data in JSON format:
${JSON.stringify(reportData, null, 2)}

Generate the HTML report now.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {parts: [{text: prompt}]},
            config: {
                systemInstruction: 'You are a financial report generation AI. You only output valid HTML code based on the provided data and instructions.',
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error('Error generating HTML report:', error);
        return "<html><body><h1>Error</h1><p>Could not generate the report due to a system error.</p></body></html>";
    }
};

const agentResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response_type: {
            type: Type.STRING,
            description: "The category of the agent's response. Must be one of: 'textual_answer', 'action_confirmation', 'data_request_clarification'.",
            enum: ["textual_answer", "action_confirmation", "data_request_clarification"]
        },
        text_content: {
            type: Type.STRING,
            description: "The primary textual content of the response, suitable for direct display to the user."
        },
        requires_confirmation: {
            type: Type.BOOLEAN,
            description: "Set to true if the response is a question or an action that requires user confirmation before proceeding."
        }
    },
    required: ["response_type", "text_content", "requires_confirmation"]
};


export const getAgentCommandResponse = async (
    agentName: string, 
    command: string, 
    history: AgentCommand[]
): Promise<string | null> => {
    if (!ai) return JSON.stringify({ error: "AI services are currently disabled." });

    const persona = agentPersonas[agentName] || "You are a helpful AI agent.";
    
    const contents = history.map(cmd => ({
        role: cmd.role === 'user' ? 'user' : 'model',
        parts: [{ text: cmd.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: command }] });

    const systemInstruction = `${persona}\n\nYou MUST respond in a valid JSON format that adheres to the provided schema. Do not add any explanatory text outside of the JSON object. Your primary textual answer must be in the 'text_content' field.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
                maxOutputTokens: 250,
                responseMimeType: "application/json",
                responseSchema: agentResponseSchema,
            }
        });
        return response.text;
    } catch (error: any) {
        console.error(`Error getting command response from ${agentName}:`, error);
        
        let errorMessage = "Sorry, I encountered an error while processing your command.";
        if (error.message) {
             if (error.message.includes('SAFETY')) {
                errorMessage = "The request was blocked due to safety settings.";
            } else if (error.message.includes('API key')) {
                errorMessage = "The API key is invalid or has expired.";
            }
        }
        
        return JSON.stringify({ error: errorMessage });
    }
};
