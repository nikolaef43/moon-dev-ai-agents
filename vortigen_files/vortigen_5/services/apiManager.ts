
import { APIProvider, APIProviderName } from '../types';

/**
 * Manages multiple AI API providers, handling failover, rate limiting, and routing.
 * This is a critical component for a production-ready system to ensure redundancy.
 * Per the audit, this class acts as an abstraction layer (plugin manager) for different
 * AI service providers, keeping provider-specific logic out of the main application.
 */
class MultiAPIManager {
    private providers: APIProvider[];
    private currentProviderIndex: number = 0;

    constructor(initialProviders: APIProvider[]) {
        this.providers = this.sortProviders(initialProviders);
        this.currentProviderIndex = 0;
    }

    private sortProviders(providers: APIProvider[]): APIProvider[] {
        return providers.sort((a, b) => a.priority - b.priority);
    }

    public updateProviders(newProviders: APIProvider[]) {
        this.providers = this.sortProviders(newProviders);
        this.currentProviderIndex = 0; // Reset to highest priority
    }

    public getCurrentProvider(): APIProvider | null {
        const enabledProviders = this.providers.filter(p => p.enabled);
        if (enabledProviders.length === 0) return null;
        return enabledProviders[this.currentProviderIndex];
    }
    
    /**
     * Simulates calling the currently active AI provider.
     * In a real implementation, this would contain the logic to format requests
     * for different provider APIs (e.g., Gemini, OpenAI, Anthropic). This is the
     * core of the "plugin" architecture for AI services.
     */
    public async callAPI(prompt: string, context?: any): Promise<string> {
        let attempts = 0;
        const enabledProviders = this.providers.filter(p => p.enabled);

        if (enabledProviders.length === 0) {
            throw new Error("No enabled AI providers available.");
        }

        while (attempts < enabledProviders.length) {
            const provider = this.getCurrentProvider();
            if (!provider) {
                 throw new Error("Could not select a provider.");
            }

            try {
                console.log(`Attempting to call API with ${provider.provider} (Model: ${provider.model})`);
                
                let simulatedDelay = 200 + Math.random() * 300;
                let successMessage = `Successful response from ${provider.provider}: Analysis complete.`;

                switch(provider.provider) {
                    case 'groq':
                        simulatedDelay = 50 + Math.random() * 100; // Groq is fast
                        successMessage = `[GROQ FAST INFERENCE] Response from ${provider.model}: Analysis complete.`;
                        break;
                    case 'anthropic':
                        simulatedDelay = 400 + Math.random() * 400; // Anthropic can be slower
                        successMessage = `[CLAUDE] Response from ${provider.model}: The analysis indicates a high probability of success.`;
                        break;
                    case 'deepseek':
                        simulatedDelay = 150 + Math.random() * 200;
                        successMessage = `[DEEPSEEK CODER] Response from ${provider.model}: Logical analysis passed.`;
                        break;
                    case 'gemini':
                         simulatedDelay = 250 + Math.random() * 200;
                        successMessage = `[GEMINI] Response from ${provider.model}: The generated insight is as follows.`;
                        break;
                    case 'openai':
                        simulatedDelay = 300 + Math.random() * 300;
                        successMessage = `[OPENAI] Response from ${provider.model}: Based on the data, the conclusion is...`;
                        break;
                }

                await new Promise(resolve => setTimeout(resolve, simulatedDelay));
                
                // Simulate a random failure for demonstration
                if (Math.random() < 0.2) { // 20% chance of failure
                    throw new Error("Simulated API failure");
                }
                
                return successMessage;

            } catch (error) {
                console.warn(`API call failed for ${provider.provider}. Reason:`, error);
                await this.switchProvider(`Failed to call ${provider.provider}`);
                attempts++;
            }
        }
        
        throw new Error("All AI providers failed. Check API keys and service status.");
    }

    /**
     * Handles automatic failover by rotating to the next available provider.
     */
    public async switchProvider(reason: string): Promise<void> {
        console.log(`Switching provider. Reason: ${reason}`);
        const enabledProviders = this.providers.filter(p => p.enabled);
        if (enabledProviders.length > 0) {
             this.currentProviderIndex = (this.currentProviderIndex + 1) % enabledProviders.length;
             const newProvider = this.getCurrentProvider();
             console.log(`Switched to new provider: ${newProvider?.provider}`);
        }
    }
}

// Singleton instance
let apiManagerInstance: MultiAPIManager | null = null;

export const getApiManager = (providers: APIProvider[]): MultiAPIManager => {
    if (!apiManagerInstance) {
        apiManagerInstance = new MultiAPIManager(providers);
    } else {
        apiManagerInstance.updateProviders(providers);
    }
    return apiManagerInstance;
};