import commonStyles from "../../styles/common.css?raw";
import notificationStyles from "../../styles/notification.css?raw";
import autoButtonStyles from "../../styles/auto-button.css?raw";

export class ShadowStyleManager {
  static getCommonStyles(): string {
    return commonStyles;
  }

  static getNotificationStyles(): string {
    return notificationStyles;
  }

  static getAutoButtonStyles(): string {
    return autoButtonStyles;
  }
}
