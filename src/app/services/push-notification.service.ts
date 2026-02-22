import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { CommonService } from './common.service';
import { StorageService } from './storage.service';
import { WebService } from './web.service';

const CHANNEL_ID = 'twinker_orders';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {

  private listenersAdded = false;

  constructor(
    private web: WebService,
    private storage: StorageService,
    private commonService: CommonService,
    private router: Router,
  ) {}

  /**
   * Request permission, register for push, and wire up listeners.
   * Safe to call multiple times — only sets up listeners once.
   * Should be called after the user is authenticated and stored.
   */
  async init() {
    if (!Capacitor.isNativePlatform()) return;

    // Create the notification channel (Android 8+ requirement)
    if (Capacitor.getPlatform() === 'android') {
      await PushNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Twinker Orders',
        description: 'Order status updates and delivery notifications',
        importance: 5, // IMPORTANCE_HIGH — heads-up notifications
        sound: 'default',
        vibration: true,
        visibility: 1,
      });
    }

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    if (this.listenersAdded) return;
    this.listenersAdded = true;

    // Token registered / refreshed → persist to backend
    await PushNotifications.addListener('registration', (token: Token) => {
      const user = this.storage.getUser();
      if (!user?._id) return;
      this.web.patch(`users/${user._id}/fcm-token`, { token: token.value }).subscribe({
        error: () => { /* silent */ }
      });
    });

    // Registration failed
    await PushNotifications.addListener('registrationError', (err: any) => {
      console.warn('[FCM] Registration error:', err);
    });

    // Foreground notification — show as toast
    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      const title = notification.title || 'Twinker';
      const body = notification.body || '';
      this.commonService.presentToast('top', `${title}: ${body}`, 'primary');
    });

    // User tapped a notification → navigate to relevant page
    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      const data = action.notification.data || {};
      this.handleNotificationTap(data);
    });
  }

  /**
   * Clear the FCM token from the backend and remove all listeners.
   * Call on logout before clearing storage.
   */
  async clearToken() {
    if (!Capacitor.isNativePlatform()) return;
    const user = this.storage.getUser();
    if (user?._id) {
      this.web.delete(`users/${user._id}/fcm-token`).subscribe({ error: () => {} });
    }
    await PushNotifications.removeAllListeners();
    this.listenersAdded = false;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private handleNotificationTap(data: Record<string, string>) {
    const { type, orderId } = data;
    if (!type) return;

    switch (type) {
      case 'new_order':
      case 'order_cancelled':
        // Vendor — go to vendor orders
        this.router.navigate(['/vendor-orders']);
        break;

      case 'order_ready_for_pickup':
        // Delivery boy — go to delivery orders
        this.router.navigate(['/delivery-orders']);
        break;

      case 'order_confirmed':
      case 'delivery_assigned':
      case 'out_for_delivery':
      case 'delivered':
      case 'vendor_cancelled':
        // Customer — go to orders page
        this.router.navigate(['/tabs/orders']);
        break;

      default:
        this.router.navigate(['/tabs/home']);
    }
  }
}
