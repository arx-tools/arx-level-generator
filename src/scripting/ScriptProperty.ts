export abstract class ScriptProperty<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }

  abstract toString(): string | Promise<string>
}
