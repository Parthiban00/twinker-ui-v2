import { Component, ElementRef, OnDestroy, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GmapsService } from 'src/app/services/gmaps/gmaps.service';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.scss'],
  standalone: false,
})
export class OrderTrackingPage implements OnDestroy {
  @ViewChild('mapRef') mapRef!: ElementRef;

  orderId: string = '';
  order: any = null;
  isLoading = true;

  private map: any = null;
  private deliveryBoyMarker: any = null;
  private trackInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private gmapsService: GmapsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      if (this.orderId) this.loadOrder();
    });
  }

  ionViewWillLeave() {
    this.stopTracking();
  }

  ngOnDestroy() {
    this.stopTracking();
  }

  private stopTracking() {
    if (this.trackInterval) {
      clearInterval(this.trackInterval);
      this.trackInterval = null;
    }
  }

  loadOrder() {
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res: any) => {
        this.ngZone.run(async () => {
          this.order = res?.data || null;
          this.isLoading = false;
          this.cdr.detectChanges();

          if (this.order) {
            // Give the DOM time to render the map container
            setTimeout(() => this.initMap(), 200);
          }
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  private async initMap() {
    try {
      const googleMaps = await this.gmapsService.loadGoogleMaps();

      const deliveryCoords = this.order?.deliveryAddress?.coords;
      const center = {
        lat: deliveryCoords?.lat || 9.8472923,
        lng: deliveryCoords?.lng || 78.47478,
      };

      this.map = new googleMaps.Map(this.mapRef.nativeElement, {
        center,
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ]
      });

      // Vendor markers (red pins)
      const vendors = this.order?.vendorOrders || [];
      const bounds = new googleMaps.LatLngBounds();

      for (const vo of vendors) {
        const v = vo.vendor;
        if (v?.latitude && v?.longitude) {
          const vendorPos = {
            lat: parseFloat(v.latitude),
            lng: parseFloat(v.longitude),
          };
          const marker = new googleMaps.Marker({
            position: vendorPos,
            map: this.map,
            title: vo.vendorName || v.name,
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              fillColor: '#e74c3c',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
              scale: 10,
            },
            label: {
              text: (vo.vendorName || v.name || 'V').charAt(0),
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
            }
          });

          const infoWindow = new googleMaps.InfoWindow({
            content: `<div style="font-family:sans-serif;font-size:13px;padding:4px"><strong>${vo.vendorName || v.name}</strong><br><span style="color:#888;font-size:11px">Pickup Point</span></div>`
          });
          marker.addListener('click', () => infoWindow.open(this.map, marker));
          bounds.extend(vendorPos);
        }
      }

      // User/delivery address marker (green home)
      if (deliveryCoords?.lat && deliveryCoords?.lng) {
        const userPos = { lat: deliveryCoords.lat, lng: deliveryCoords.lng };
        new googleMaps.Marker({
          position: userPos,
          map: this.map,
          title: 'Your Location',
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z',
            fillColor: '#2ecc71',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new googleMaps.Point(12, 22),
          },
        });
        bounds.extend(userPos);
      }

      // Delivery boy marker
      if (this.order?.deliveryBoy?.location?.latitude) {
        this.addOrUpdateDeliveryBoyMarker(googleMaps);
        bounds.extend({
          lat: this.order.deliveryBoy.location.latitude,
          lng: this.order.deliveryBoy.location.longitude,
        });
      }

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds);
      }

      // Start tracking poll
      if (this.order?.status === 'out_for_delivery') {
        this.startTrackingPoll();
      }
    } catch (err) {
      console.error('Map init error', err);
    }
  }

  private addOrUpdateDeliveryBoyMarker(googleMaps?: any) {
    const loc = this.order?.deliveryBoy?.location;
    if (!loc?.latitude || !loc?.longitude) return;

    const pos = { lat: loc.latitude, lng: loc.longitude };

    if (this.deliveryBoyMarker) {
      this.deliveryBoyMarker.setPosition(pos);
      return;
    }

    const maps = googleMaps || (window as any).google?.maps;
    if (!maps) return;

    this.deliveryBoyMarker = new maps.Marker({
      position: pos,
      map: this.map,
      title: this.order?.deliveryBoy?.name || 'Delivery Partner',
      icon: {
        path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: '#F85C70',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 6,
        rotation: 0,
      },
      animation: maps.Animation.BOUNCE,
    });
  }

  private startTrackingPoll() {
    this.stopTracking();
    this.trackInterval = setInterval(() => this.refreshLocation(), 5000);
  }

  private refreshLocation() {
    if (!this.orderId) return;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res: any) => {
        const updated = res?.data;
        if (!updated) return;

        // If order completed, stop tracking
        if (!['placed', 'confirmed', 'out_for_delivery'].includes(updated.status)) {
          this.stopTracking();
        }

        const prevLoc = this.order?.deliveryBoy?.location;
        const newLoc = updated?.deliveryBoy?.location;
        this.order = updated;

        // Update marker if location changed
        if (newLoc?.latitude && newLoc?.longitude) {
          const changed =
            !prevLoc ||
            prevLoc.latitude !== newLoc.latitude ||
            prevLoc.longitude !== newLoc.longitude;

          if (changed) {
            this.ngZone.run(() => {
              this.addOrUpdateDeliveryBoyMarker();
              this.cdr.detectChanges();
            });
          }
        }
      }
    });
  }

  get deliveryBoy(): any {
    return this.order?.deliveryBoy;
  }

  get estimatedMinutes(): number {
    if (!this.order?.estimatedDeliveryTime) return 30;
    const diff = new Date(this.order.estimatedDeliveryTime).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 60000));
  }

  callDeliveryBoy() {
    const phone = this.deliveryBoy?.phone;
    if (phone) window.open(`tel:${phone}`);
  }

  openDirections() {
    const loc = this.deliveryBoy?.location;
    if (loc?.latitude && loc?.longitude) {
      window.open(`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`);
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      placed: 'Order Placed',
      confirmed: 'Confirmed',
      out_for_delivery: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  goBack() {
    this.router.navigate(['/tabs/orders']);
  }
}
