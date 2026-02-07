import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit {
  ordersCard: any = [
    {
      type: 'In Progress',
      value: 'in-progress',
      count: 0,
    },
    {
      type: 'Completed',
      value: 'completed',
      count: 0,
    },
    {
      type: 'Cancelled',
      value: 'cancelled',
      count: 0,
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  handleRefresh(ev: any) {
    this.ngOnInit();
    ev.target.complete();
  }

}
