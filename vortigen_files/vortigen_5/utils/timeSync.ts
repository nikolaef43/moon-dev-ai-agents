/**
 * A singleton utility to synchronize client-side time with server time.
 * This is crucial for ensuring all events and activities are timestamped
 * accurately, preventing ordering issues due to client clock drift.
 */
export class TimeSync {
    private static instance: TimeSync;
    private serverOffset: number = 0;
    private isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): TimeSync {
        if (!TimeSync.instance) {
            TimeSync.instance = new TimeSync();
        }
        return TimeSync.instance;
    }

    /**
     * Calibrates the time offset with the server. In a real app, this would
     * make an API call. Here, we simulate it.
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        // Simulate a network request to a '/api/time' endpoint
        const clientSendTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate RTT
        const serverTime = Date.now() + 500; // Simulate server is 500ms ahead
        const clientReceiveTime = Date.now();

        const rtt = clientReceiveTime - clientSendTime;
        this.serverOffset = serverTime - (clientReceiveTime - rtt / 2);
        this.isInitialized = true;
        console.log(`Time synchronized with server. Offset: ${this.serverOffset.toFixed(0)}ms`);
    }

    /**
     * Returns the current server-synchronized time.
     */
    public async now(): Promise<number> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return Date.now() + this.serverOffset;
    }
}

// Initialize on load
TimeSync.getInstance().initialize();
