import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebService {
  readonly rootURL;

  constructor(private http: HttpClient) {
    this.rootURL = environment.baseUrl;
  }

  get(uri: string) {
    console.log(uri);
    return this.http.get(`${this.rootURL}/${uri}`);
  }

  post(uri: string, payload: object) {
    return this.http.post(`${this.rootURL}/${uri}`, payload);
  }

  patch(uri: string, payload: object) {
    return this.http.patch(`${this.rootURL}/${uri}`, payload);
  }

  delete(uri: string, payload: object) {
    return this.http.get(`${this.rootURL}/${uri}`, payload);
  }

}
