export default function assert(condition: any, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
}