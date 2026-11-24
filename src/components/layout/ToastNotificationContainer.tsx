import { useTicketStore } from "../../store/barrel";
import { ToastList } from "../../ui/barrel";

export function ToastNotificationContainer() {
  const { toasts, removeToast } = useTicketStore();
  return <ToastList toasts={toasts} onDismiss={removeToast} />;
}
