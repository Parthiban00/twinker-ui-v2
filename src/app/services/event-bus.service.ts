import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private eventBus = new Subject<{ name: string; payload: any }>();

  constructor() {}

  emit(eventName: string, payload: any): void {
    this.eventBus.next({ name: eventName, payload });
  }

  on(eventName: string) {
    return this.eventBus.asObservable().pipe(
      filter(event => event.name === eventName),
      map(event => event.payload)
    );
  }
}
