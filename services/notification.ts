export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notifier {
  show(message: string, type?: NotificationType): void;
}
