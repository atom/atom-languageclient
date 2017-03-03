// @flow

export default class NullLogger {
  warn(args: any): void { }
  error(args: any): void { }
  info(args: any): void { }
  log(args: any): void { }
  debug(args: any): void { }
}
