import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
  standalone: false,
})
export class CategoryListPage implements OnInit {
  categories: any;
  imgBaseUrl: string = environment.imageBaseUrl;

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  ngOnInit(): void {
    this.categories = this.navParams.get('categories');
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('data', 'confirm');
  }

  handleInput(ev: any) {

  }

}
