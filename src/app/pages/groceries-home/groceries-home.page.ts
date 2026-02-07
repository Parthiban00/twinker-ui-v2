import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-groceries-home',
  templateUrl: './groceries-home.page.html',
  styleUrls: ['./groceries-home.page.scss'],
  standalone: false,
})
export class GroceriesHomePage implements OnInit {
  featuredItems: any = [{
    productName: 'Product Name',
    vendor: { vendorName: 'vendor name' },
    price: 140,
    actualPrice: 140
  }, {
    productName: 'Product Name',
    vendor: { vendorName: 'vendor name' },
    price: 140,
    actualPrice: 140
  }];

  quantities: [
    0.2, 0, 5, 1, 1.5, 2
  ];

  category = 'fruits';
  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: {
      delay: 3000,
    },
    loop: true,
  };

  items = [
    { name: 'Apples', image: 'assets/biriyani.jpg' },
    { name: 'Oranges', image: 'assets/img/orange.jpg' },
    { name: 'Kiwi', image: 'assets/img/kiwi.jpg' },
    { name: 'Strawberries', image: 'assets/img/strawberry.jpg' },
    { name: 'Mango', image: 'assets/img/mango.jpg' },
    { name: 'Pineapple', image: 'assets/img/pineapple.jpg' },
  ];

  constructor() { }

  ngOnInit() {
  }

  handleSearchInput(ev: any) {

  }
}
