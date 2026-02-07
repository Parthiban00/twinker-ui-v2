import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-stepper',
  templateUrl: './status-stepper.page.html',
  styleUrls: ['./status-stepper.page.scss'],
  standalone: false,
})
export class StatusStepperPage implements OnInit {
  statusDetails: any = {
    placedTime: '20/01/2024',
    status: 'Placed',
    adminConfirmed: '',
    confirmedTime: '',
  };

  constructor() { }

  ngOnInit() {
  }

}
