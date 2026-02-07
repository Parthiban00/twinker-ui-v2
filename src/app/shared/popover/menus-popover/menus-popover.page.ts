import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams, PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-menus-popover',
  templateUrl: './menus-popover.page.html',
  styleUrls: ['./menus-popover.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MenusPopoverPage implements OnInit {
  list: any = ['Restaurants', 'Hotels', 'Home Mades', 'Cakes'];
  newArrayDataOfOjbect;
  category = [];
  categoryFromParant = [];

  constructor(
    private navParams: NavParams,
    public popoverController: PopoverController
  ) {
    this.category = Object.values(this.navParams.data);
    console.log(typeof this.category);
    console.log(this.category.length);
  }

  ngOnInit() {
    console.log('menus popover page entered');
  }

  scrollCategory() {
    console.log('category item click');
    //this.modalController.dismiss();
  }

  _dismiss(itemId: string) {
    console.log('item id ' + itemId);
    this.popoverController.dismiss({
      fromPopover: itemId,
    });
  }
}
