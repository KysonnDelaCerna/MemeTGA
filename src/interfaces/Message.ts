export default interface IMessage {
  text: string;
  closable: boolean;
  sticky: boolean;
  life: number;
  severity: "success" | "info" | "warn" | "error";
}
