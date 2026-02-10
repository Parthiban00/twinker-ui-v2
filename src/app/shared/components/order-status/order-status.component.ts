import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  state: 'placing' | 'success' = 'placing';
  countdown = 10;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private startCountdown() {
    this.timerInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearTimer();
        this.onOrderPlaced();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private onOrderPlaced() {
    this.state = 'success';
    localStorage.removeItem('cart-items');
    this.cdr.detectChanges();
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  cancelOrder() {
    this.clearTimer();
    this.modalCtrl.dismiss(null, 'cancel');
  }

  trackOrder() {
    this.modalCtrl.dismiss({ action: 'track' }, 'confirm');
  }

  goHome() {
    this.modalCtrl.dismiss({ action: 'home' }, 'confirm');
  }
}
