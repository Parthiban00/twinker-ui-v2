import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  user: any = {};

  constructor() {}

  ngOnInit() {
    try {
      const raw = localStorage.getItem('user-data');
      if (raw) {
        this.user = JSON.parse(raw);
      }
    } catch {}
  }
}
