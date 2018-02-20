 // tslint:disable:no-console

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

  public warn(...args: any[]) {
    console.warn(...this.format(args));
  }

  public error(...args: any[]) {
    console.error(...this.format(args));
  }

  public info(...args: any[]) {
    console.info(...this.format(args));
  }

  public debug(...args: any[]) {
    console.debug(...this.format(args));
  }

  public log(...args: any[]) {
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
  public warn(...args: any[]): void {}
  public error(...args: any[]): void {}
  public info(...args: any[]): void {}
  public log(...args: any[]): void {}
  public debug(...args: any[]): void {}
}
