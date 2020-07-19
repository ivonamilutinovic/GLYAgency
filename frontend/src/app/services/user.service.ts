import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';
import { User } from '../shared/user';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  _id: string = undefined;
  adminFlag: boolean = false;
  email: string = undefined;

  constructor(private http: HttpClient) {
  }

  // function which will return users id as string
  getAdminFlag(): boolean {
    return this.adminFlag;
  }

  // function which will set users id
  setAdminFlag(value: boolean) {
    this.adminFlag = value;
  }

  // function which will clear users id
  clearAdminFlag() {
    this.adminFlag = false;
  }

  // function which will return users id as string
  getId(): string {
    return this._id;
  }

  // function which will set users id
  setId(_id: string) {
    this._id = _id;
  }

  // function which will clear users id
  clearId() {
    this._id = undefined;
  }

  // function which will return users email as string
  getEmail(): string {
    return this.email;
  }

  // function which will set users email
  setEmail(value: string) {
    this.email = value;
  }

  // function which will clear users email
  clearEmail() {
    this.email = undefined;
  }

  // function which will handle get all agency agents request
  getAdmins() {
    return this.http.get(baseURL + 'users')
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle get user by id request
  getUserById(_id) {
    return this.http.get<User>(baseURL + 'users/user/' + _id)
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle change User Data requset
  changeUserData(requestBody) {
    return this.http.post<any>(baseURL + 'users/changedata', requestBody)
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle change password requset
  changePassword(requestBody) {
    return this.http.post<any>(baseURL + 'users/changepassword', requestBody)
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle change description request
  changeDescription(requestBody) {
    return this.http.post<any>(baseURL + 'users/changedata', requestBody)
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle change photo request
  changePhoto(formData) {
    return this.http.post<any>(baseURL + 'users/photoupload', formData)
      .pipe(res => {
        return res;
      },
        catchError(error => this.handleError(error)));
  }

  // function which will handle errors
  handleError(err: HttpErrorResponse | any) {
    let errorMessage: string;
    if (err.error.success !== undefined)
      errorMessage = err.error.statusMessage;
    else if (err.name === "HttpErrorResponse") {
      if (err.error == "Unauthorized")
        errorMessage = '401: Niste prijavljeni!';
      else
        errorMessage = 'Podržani formati su jpg, jpeg, png i gif!';
    }
    else
      errorMessage = `${err.status} - ${err.statusText || ''} ${err.message}`;

    return throwError(errorMessage);
  }




}
