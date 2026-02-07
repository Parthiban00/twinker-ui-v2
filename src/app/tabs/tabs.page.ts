import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {

  constructor() { }

  ngOnInit() {
    const list = document.querySelectorAll('.list');
    const nav = document.querySelector('.navigation');
    list.forEach(item => item.addEventListener('click', (e: any) => {
      list.forEach(li => li.classList.remove('active'));
      e.currentTarget.classList.add('active');
    }));
  }

}
