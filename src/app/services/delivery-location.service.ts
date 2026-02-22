import { Injectable, NgZone } from '@angular/core';
import { Geolocation, WatchPositionCallback } from '@capacitor/geolocation';
import { OrderService } from './order.service';

const SEND_INTERVAL_MS = 15000; // send GPS update every 15 seconds max

@Injectable({ providedIn: 'root' })
export class DeliveryLocationService {

  private watchId: string | null = null;
  private activeOrderId: string | null = null;
  private lastSentAt = 0;

  constructor(
    private orderService: OrderService,
    private ngZone: NgZone,
  ) {}

  /** Start watching GPS and forwarding to the backend for this order */
  async startTracking(orderId: string) {
    if (this.watchId) this.stopTracking(); // clear any previous watch
    this.activeOrderId = orderId;
    this.lastSentAt = 0;

    try {
      await Geolocation.requestPermissions();

      const callback: WatchPositionCallback = (position, err) => {
        if (err || !position) return;
        this.ngZone.run(() => this.maybeSend(position.coords.latitude, position.coords.longitude));
      };

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000 },
        callback
      );
    } catch (e) {
      console.warn('DeliveryLocationService: geolocation not available', e);
    }
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.activeOrderId = null;
    this.lastSentAt = 0;
  }

  get isTracking(): boolean {
    return !!this.watchId;
  }

  private maybeSend(latitude: number, longitude: number) {
    const now = Date.now();
    if (now - this.lastSentAt < SEND_INTERVAL_MS) return; // throttle
    if (!this.activeOrderId) return;
    this.lastSentAt = now;
    this.orderService.updateDeliveryLocation(this.activeOrderId, { latitude, longitude })
      .subscribe({ error: (e) => console.warn('Location send failed', e) });
  }
}
