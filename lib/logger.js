// @flow

export type Logger = {
  warn(args: any): void,
  error(args: any): void,
  info(args: any): void,
  log(args: any): void,
  debug(args: any): void,
}

export class ConsoleLogger {
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  warn(...args: any) {
    console.warn(...this.format(args));
  }

  error(...args: any) {
    console.error(...this.format(args));
  }

  info(...args: any) {
    console.info(...this.format(args));
  }

  debug(...args: any) {
    console.debug(...this.format(args));
  }

  log(...args: any) {
    console.log(...this.format(args));
  }

  format(args: any): any {
    args = args.filter(a => a != null);
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
  warn(args: any): void { }
  error(args: any): void { }
  info(args: any): void { }
  log(args: any): void { }
  debug(args: any): void { }
}
