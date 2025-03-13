
const { Rcon } = require('rcon-client');
const EventEmitter = require('events');

class MinecraftManager extends EventEmitter {
    constructor() {
        super();
        this.rcon = null;
        this.connected = false;
        this.serverInfo = null;
        this.logPollingInterval = null;
        this.lastLogTimestamp = Date.now();
    }

    async connect(host, port, password) {
        if (this.connected) {
            throw new Error('Already connected to a Minecraft server');
        }

        try {
            // Create new RCON connection
            this.rcon = new Rcon({ host, port: port || 25575, password });
            
            // Listen for connection events
            this.rcon.on('connect', () => {
                console.log(`Connected to Minecraft server at ${host}:${port}`);
                this.emit('connect', { host, port });
            });
            
            this.rcon.on('error', (error) => {
                console.error('RCON error:', error);
                this.emit('error', error);
            });
            
            this.rcon.on('end', () => {
                console.log('RCON connection closed');
                this.stopLogPolling();
                this.connected = false;
                this.serverInfo = null;
                this.emit('disconnect');
            });
            
            // Connect to the server
            await this.rcon.connect();
            
            // Save connection info
            this.serverInfo = { host, port };
            this.connected = true;
            
            // Start polling for logs
            this.startLogPolling();
            
            return true;
        } catch (error) {
            console.error('Connection error:', error);
            this.rcon = null;
            this.connected = false;
            throw error;
        }
    }

    async disconnect() {
        if (!this.connected || !this.rcon) {
            return false;
        }
        
        try {
            this.stopLogPolling();
            await this.rcon.end();
            this.rcon = null;
            this.connected = false;
            this.serverInfo = null;
            return true;
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    }

    async executeCommand(command) {
        if (!this.connected || !this.rcon) {
            throw new Error('Not connected to any Minecraft server');
        }
        
        try {
            return await this.rcon.send(command);
        } catch (error) {
            console.error('Command execution error:', error);
            throw error;
        }
    }

    async say(message) {
        return this.executeCommand(`say ${message}`);
    }

    async getServerStatus() {
        if (!this.connected || !this.rcon) {
            throw new Error('Not connected to any Minecraft server');
        }
        
        try {
            // Execute multiple commands to get server information
            const playerList = await this.executeCommand('list');
            const tps = await this.executeCommand('tps').catch(() => 'TPS command not available');
            const worldTime = await this.executeCommand('time query daytime').catch(() => 'Unknown');
            
            return {
                players: playerList,
                performance: tps,
                worldInfo: worldTime,
                serverInfo: this.serverInfo
            };
        } catch (error) {
            console.error('Status retrieval error:', error);
            throw error;
        }
    }

    startLogPolling() {
        // Stop any existing polling
        this.stopLogPolling();
        
        // Start polling for logs every 5 seconds
        this.logPollingInterval = setInterval(async () => {
            try {
                // This is a hack since vanilla Minecraft doesn't have a command to get logs
                // On BisectHosting, we could potentially use their API if available
                // For now we'll use "list" command as a heartbeat
                const response = await this.executeCommand('list');
                
                // If we get a response, emit it as a "log" event
                if (response) {
                    this.emit('heartbeat', {
                        timestamp: new Date(),
                        content: response
                    });
                }
            } catch (error) {
                console.error('Log polling error:', error);
                this.emit('error', error);
            }
        }, 5000);
    }

    stopLogPolling() {
        if (this.logPollingInterval) {
            clearInterval(this.logPollingInterval);
            this.logPollingInterval = null;
        }
    }

    isConnected() {
        return this.connected;
    }

    getServerInfo() {
        return this.serverInfo;
    }
}

module.exports = new MinecraftManager();
