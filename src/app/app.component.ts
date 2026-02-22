import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from './services/push-notification.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  constructor(
    private pushNotif: PushNotificationService,
    private storageService: StorageService,
  ) {}

  ngOnInit() {
    // If the user is already logged in (returning session), initialise push notifications.
    // For new logins, push notification init is triggered after OTP verification.
    const user = this.storageService.getUser();
    if (user?._id) {
      this.pushNotif.init();
    }
  }
}
