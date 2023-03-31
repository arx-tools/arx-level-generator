export abstract class ScriptCommand {
  abstract toString(): string | Promise<string>
}
