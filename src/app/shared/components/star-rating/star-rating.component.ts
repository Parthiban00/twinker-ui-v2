import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports:[IonicModule, CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent {

  @Input() rating: number;
  @Input() starCount = 5;
  @Input() color = 'primary';
  @Output() ratingUpdated = new EventEmitter<number>();

  stars: boolean[] = [];

  constructor() { }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit() {
    this.calculateStars();
  }

  calculateStars() {
    this.stars = Array(this.starCount).fill(false).map((_, i) => i < this.rating);
  }

  onStarClick(index: number) {
    this.rating = index + 1;
    this.calculateStars();
    this.ratingUpdated.emit(this.rating);
  }

}
