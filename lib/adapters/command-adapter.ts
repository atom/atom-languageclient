import {LanguageClientConnection} from '../languageclient';
import {ServerCapabilities} from 'vscode-languageserver-protocol';
import {DisposableLike} from 'atom';
import * as UUID from 'uuid/v4';

const GLOBAL: any = global;

export class CommandAdapter implements DisposableLike {

    private registrations: Map<string, string[]>;

    constructor(private connection: LanguageClientConnection) {
        this.registrations = new Map();
        connection.onRegisterCommand(registration => {
            if (registration.registerOptions && Array.isArray(registration.registerOptions.commands)) {
                this.registerCommands(registration.id, registration.registerOptions.commands);
            }
        });
        connection.onUnregisterCommand(unregisteration => this.unregisterCommands(unregisteration.id));
    }

    initialize(capabilities: ServerCapabilities) {
        if (capabilities.executeCommandProvider && Array.isArray(capabilities.executeCommandProvider.commands)) {
            this.registerCommands(UUID(), capabilities.executeCommandProvider.commands)
        }
    }

    registerCommands(id: string, commands: string[]): void{
        const cmdRegistry = this.getLspCommandRegistry();
        const registeredCommands = commands.filter(cmd => {
           const handler = (params: any[]) => this.connection.executeCommand({
               command: cmd,
               arguments: params
           });
           if (cmdRegistry.register(cmd, handler)) {
               return true;
           } else {
               console.error(`Trying to register duplicate command: "${cmd}"`)
           }
        });
        if (this.registrations.has(id)) {
            throw new Error(`Duplicate registration id: ${id}`);
        }
        this.registrations.set(id, registeredCommands);
    }

    executeCommand(id: string, params: any[]): Promise<any> {
        return this.getLspCommandRegistry().execute(id, params);
    }

    unregisterCommands(id: string) {
        if (this.registrations.has(id)) {
            const commands = this.registrations.get(id);
            const cmdRegistry = this.getLspCommandRegistry();
            if (commands && Array.isArray(commands)) {
                commands.forEach(command => cmdRegistry.unregister(command));
            }
            this.registrations.delete(id);
        }
    }

    dispose() {
        const cmdRegistry = this.getLspCommandRegistry();
        this.registrations.forEach(commands => commands.forEach(command => cmdRegistry.unregister(command)));
        this.registrations.clear();
    }

    private getLspCommandRegistry(): LspCommandRegistry {
        if (!GLOBAL.lspCommandRegistry) {
            GLOBAL.lspCommandRegistry = new LspCommandRegistryImpl();
        }
        return <LspCommandRegistry> GLOBAL.lspCommandRegistry;
    }
}

export interface LspCommandRegistry {
    register(command: string, handler: (params: any[]) => Promise<any>): boolean;
    execute(command: string, params: any[]): Promise<any>;
    unregister(command: string): boolean;
}

class LspCommandRegistryImpl implements LspCommandRegistry {

    private commandIdToHandler: Map<string, (params: any[]) => Promise<any>>;

    constructor() {
        this.commandIdToHandler = new Map();
    }

    register(command: string, handler: (params: any[]) => Promise<any>): boolean {
        if (this.commandIdToHandler.has(command)) {
            return false;
        } else {
            this.commandIdToHandler.set(command, handler);
            return true;
        }
    }

    execute(command: string, params: any[]): Promise<any> {
        if (this.commandIdToHandler.has(command)) {
            const handler = this.commandIdToHandler.get(command);
            if (handler) {
                return handler(params);
            } else {
                throw new Error(`Command "${command}" has no handler`);
            }
        } else {
            throw new Error(`Command "${command}" is not registered`);
        }
    }

    unregister(command: string): boolean {
        return this.commandIdToHandler.delete(command);
    }

}
