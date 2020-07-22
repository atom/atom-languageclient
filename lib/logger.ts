/* eslint-disable no-console */

export interface Logger {
  warn(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  debug(...args: any[]): void;
}

export class ConsoleLogger {
  public prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public warn(...args: any[]): void {
    console.warn(...this.format(args));
  }

  public error(...args: any[]): void {
    console.error(...this.format(args));
  }

  public info(...args: any[]): void {
    console.info(...this.format(args));
  }

  public debug(...args: any[]): void {
    console.debug(...this.format(args));
  }

  public log(...args: any[]): void {
    console.log(...this.format(args));
  }

  public format(args_: any): any {
    const args = args_.filter((a: any) => a != null);
    if (typeof args[0] === 'string') {
      if (args.length === 1) {
        return [`${this.prefix} ${args[0]}`];
      } else if (args.length === 2) {
        return [`${this.prefix} ${args[0]}`, args[1]];
      } else {
        return [`${this.prefix} ${args[0]}`, args.slice(1)];
      }
    }

    return [`${this.prefix}`, args];
  }
}

export class NullLogger {
  public warn(..._args: any[]): void { }
  public error(..._args: any[]): void { }
  public info(..._args: any[]): void { }
  public log(..._args: any[]): void { }
  public debug(..._args: any[]): void { }
}

export class FilteredLogger {
  private _logger: Logger;
  private _predicate: (level: string, args: any[]) => boolean;

  public static UserLevelFilter = (level: string, _args: any[]): boolean => level === 'warn' || level === 'error';
  public static DeveloperLevelFilter = (_level: string, _args: any[]): true => true;

  constructor(logger: Logger, predicate?: (level: string, args: any[]) => boolean) {
    this._logger = logger;
    this._predicate = predicate || ((_level, _args) => true);
  }

  public warn(...args: any[]): void {
    if (this._predicate('warn', args)) {
      this._logger.warn(...args);
    }
  }

  public error(...args: any[]): void {
    if (this._predicate('error', args)) {
      this._logger.error(...args);
    }
  }

  public info(...args: any[]): void {
    if (this._predicate('info', args)) {
      this._logger.info(...args);
    }
  }

  public debug(...args: any[]): void {
    if (this._predicate('debug', args)) {
      this._logger.debug(...args);
    }
  }

  public log(...args: any[]): void {
    if (this._predicate('log', args)) {
      this._logger.log(...args);
    }
  }
}
