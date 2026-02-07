import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ItemsService } from '../items/items.service';
import { IonAccordion } from '@ionic/angular';

@Component({
  selector: 'app-essentials-home',
  templateUrl: './essentials-home.page.html',
  styleUrls: ['./essentials-home.page.scss'],
  standalone: false,
})
export class EssentialsHomePage implements OnInit {
  @ViewChildren(IonAccordion, { read: ElementRef }) categoryElements: QueryList<ElementRef>;
  expandedAccordionValues: Array<string> = [];
  categories = [
    { name: 'Chicken', image: 'assets/chicken_vector.jpg' },
    { name: 'Mutton', image: 'assets/mutton_vector.jpg' },
    { name: 'Prawn', image: 'assets/prawn.jpg' },
    { name: 'Fish', image: 'assets/fish.jpg' },
    { name: 'Grab', image: 'assets/grab.jpg' }
  ];
  dailyGroceries = [
    { name: 'Chicken', image: 'assets/chicken_vector.jpg' },
    { name: 'Mutton', image: 'assets/mutton_vector.jpg' },
    { name: 'Fish', image: 'assets/fish.jpg' },
    { name: 'Sea Foods', image: 'assets/prawn.jpg' },
    // { name: 'Grab', image: 'assets/grab.jpg' }
  ];
  vendors: string[] = ['Vendor 1', 'Vendor 2', 'Vendor 3'];

  recommendedItems = [
    { name: 'Chicken Drum Sticks (With Skin)', price: 'Rs. 600 / 500 grms', image: 'assets/chicken.jpg' },
    { name: 'Fish Steak', price: 'Rs. 800 / 500 grms', image: 'assets/mutton.jpg' }
  ];

  popularVendors: any[] = [
    {
      "_id": "665f3c3b9d7f1c96404d0257",
      "name": "Hotel Vallavan",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517371410-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:09:31.432Z",
      "updatedAt": "2024-06-04T16:09:31.432Z",
      "__v": 0,
      "popular": true
    },
    {
      "_id": "665f3d079d7f1c96404d025b",
      "name": "Swathi Mess",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517575386-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:12:55.389Z",
      "updatedAt": "2024-06-04T16:12:55.389Z",
      "__v": 0,
      "popular": true
    },
    {
      "_id": "665f3d159d7f1c96404d025f",
      "name": "Chennai Rawther",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517589554-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:13:09.556Z",
      "updatedAt": "2024-06-04T16:13:09.556Z",
      "__v": 0,
      "popular": true
    },
    {
      "_id": "665f3d1e9d7f1c96404d0263",
      "name": "Ravanan BBQ",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517598636-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:13:18.638Z",
      "updatedAt": "2024-06-04T16:13:18.638Z",
      "__v": 0,
      "popular": true
    },
    {
      "_id": "665f3d269d7f1c96404d0267",
      "name": "Sivagangai Kitchen",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517606820-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:13:26.822Z",
      "updatedAt": "2024-06-04T16:13:26.822Z",
      "__v": 0,
      "popular": false
    },
    {
      "_id": "665f3d379d7f1c96404d026b",
      "name": "Hotel Saravana Bhavan",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517623387-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:13:43.389Z",
      "updatedAt": "2024-06-04T16:13:43.389Z",
      "__v": 0,
      "popular": false
    },
    {
      "_id": "665f3d419d7f1c96404d026f",
      "name": "Hotel Annapoorani",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517633726-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:13:53.769Z",
      "updatedAt": "2024-06-04T16:13:53.769Z",
      "__v": 0,
      "popular": false
    },
    {
      "_id": "665f3d509d7f1c96404d0273",
      "name": "Malairam Restaurant",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517648898-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:14:08.900Z",
      "updatedAt": "2024-06-04T16:14:08.900Z",
      "__v": 0,
      "popular": false
    },
    {
      "_id": "665f3d5e9d7f1c96404d0277",
      "name": "Ariyabhavan",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517662254-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:14:22.260Z",
      "updatedAt": "2024-06-04T16:14:22.260Z",
      "__v": 0,
      "popular": false
    },
    {
      "_id": "665f3d6c9d7f1c96404d027b",
      "name": "Asma Thalapakatti Biriyani",
      "slogan": "enjoy the real taste",
      "openAt": "9:00 AM",
      "closeAt": "11:00 PM",
      "description": "Vendor descripton",
      "address": "123, South raja street, sivaganga",
      "acceptOrders": true,
      "dineIn": true,
      "type": "Veg/Non-Veg",
      "mobileNo": "7898787898",
      "telePhoneNo": null,
      "status": true,
      "isDeleted": false,
      "profileImgUrl": "uploads\\1717517676974-shop.jpg",
      "latitude": "9.8472923",
      "longitude": "78.47478",
      "locality": "658c494ed0a3098e8076164a",
      "categories": [
        "665dbaf558ff826fd046c02f"
      ],
      "createdAt": "2024-06-04T16:14:36.976Z",
      "updatedAt": "2024-06-04T16:14:36.976Z",
      "__v": 0,
      "popular": false
    }
  ];
  defaultAddress: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  productDetails:any;
  selectedCategory: any;

  constructor(private itemService:ItemsService) { }

  ngOnInit() {
    this.getAllProductsByVendor();
  }

  handleSearchInput(ev: any) {}

  getAllProductsByVendor() {
    const queryParams = '';

    this.itemService.getAllProductsByVendor('665f3c3b9d7f1c96404d0257', queryParams).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.productDetails = resdata.data;

            if (this.productDetails) {
              // eslint-disable-next-line no-underscore-dangle
              this.expandedAccordionValues = this.productDetails.map((productList: any) => productList.category._id);
              // eslint-disable-next-line no-underscore-dangle
              this.selectedCategory = this.productDetails[0].category._id;
            }
          } else {
            this.productDetails = [];
          }
        } else {
          // this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        // this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching popular cuisines!', 'danger');
      },
      complete: () => {
      },
    });
  }

  scrollToCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    const categoryElement = this.categoryElements.find(element => element.nativeElement.id === categoryId);

    if (categoryElement) {
      categoryElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    document.querySelector('ion-popover').dismiss();
  }

}
