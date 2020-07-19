import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';
import { UserService } from "../services/user.service";

interface AuthorisationResponse {
  status: string;
  success: string;
  admin: boolean;
  token: string;
  _id: string;
}

interface JWTResponse {
  status: string;
  success: string;
  admin: boolean;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  tokenKey = 'JWT';
  isAuthenticated: Boolean = false;
  email: Subject<string> = new Subject<string>();
  adminFlag: Subject<boolean> = new Subject<boolean>();
  authToken: string = undefined;
  _id: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient, public userService: UserService) {
  }

  // function which will check validation of JWTtoken
  checkJWTtoken() {
    this.http.get<JWTResponse>(baseURL + 'users/checkJWTtoken')
      .pipe(catchError(error => this.handleError(error)))
      .subscribe(res => {
        this.setId(res.user._id);
        this.setEmail(res.user.email);
        this.setAdminFlag(res.user.admin);
      },
        error => {
          this.destroyUserCredentials();
        });
  }

  // function which will return authentication token
  getToken(): string {
    return this.authToken;
  }

  // function which will return users email
  getEmail(): Observable<string> {
    return this.email.asObservable();
  }

  // function which will set email
  setEmail(email: string) {
    this.email.next(email);
    this.userService.setEmail(email);
  }

  // function which will clear saved email
  clearEmail() {
    this.email.next(undefined);
    this.userService.clearEmail();
  }

  // function which will return users email
  getId(): Observable<string> {
    return this._id.asObservable();
  }

  // function which will set email
  setId(_id: string) {
    this.userService.setId(_id);
    this._id.next(_id);
  }

  // function which will clear saved email
  clearId() {
    this.userService.clearId();
    this._id.next(undefined);
  }


  // function which will return admin flag of logged user
  getAdminFlag(): Observable<boolean> {
    return this.adminFlag.asObservable();
  }

  // function which will set admin flag
  setAdminFlag(value: boolean) {
    this.userService.setAdminFlag(value);
    this.adminFlag.next(value);
  }

  // function which will clear saved admin flag
  clearAdminFlag() {
    this.userService.clearAdminFlag();
    this.adminFlag.next(false);
  }

  // will be executed on ngOnInit of homepage to access user credentials from JWT if it exists
  loadUserCredentials() {
    const credentials = JSON.parse(localStorage.getItem(this.tokenKey));
    if (credentials && credentials.email !== undefined) {
      this.useCredentials(credentials);
      if (this.authToken) {
        this.checkJWTtoken();
      }
    }
  }

  // function which will store user credentials in browsers local storage
  storeUserCredentials(credentials: any) {
    localStorage.setItem(this.tokenKey, JSON.stringify(credentials));
    this.useCredentials(credentials);
  }

  // set user credentials localy
  useCredentials(credentials: any) {
    this.isAuthenticated = true;
    this.setEmail(credentials.email);
    this.setAdminFlag(credentials.admin);
    this.setId(credentials._id);
    this.authToken = credentials.token;
  }

  // destroys user credentials - set values to default
  destroyUserCredentials() {
    this.authToken = undefined;
    this.clearEmail();
    this.clearAdminFlag();
    this.isAuthenticated = false;
    this.clearId();
    localStorage.removeItem(this.tokenKey);
  }

  // sign up function
  signUp(user: any) {
    return this.http.post<AuthorisationResponse>(baseURL + 'users/signup', user)
      .pipe(map(res => {
        this.storeUserCredentials({ email: user.email, admin: res.admin, _id: res._id, token: res.token });
        return { 'success': true, 'email': user.email };
      }),
        catchError(error => this.handleError(error)));
  }

  // log in function
  logIn(user: any): Observable<any> {
    return this.http.post<AuthorisationResponse>(baseURL + 'users/login',
      { 'email': user.email, 'password': user.password })
      .pipe(map(res => {
        this.storeUserCredentials({ email: user.email, admin: res.admin, _id: res._id, token: res.token });
        return { 'success': true, 'email': user.email };
      }),
        catchError(error => this.handleError(error)));
  }

  // function which will log out the user
  logOut() {
    this.destroyUserCredentials();
  }

  // indentificator whether user is logged in or not
  isLoggedIn(): Boolean {
    return this.isAuthenticated;
  }

  // function which will handle user authentification errors
  handleError(error: HttpErrorResponse | any) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    }
    else {
      // server side error
      if (error.error.success !== undefined) {
        errorMessage = error.error.statusMessage;
      }
      else
        errorMessage = `${error.status} - ${error.statusText || ''} ${error.message}`;
    }

    return throwError(errorMessage);
  }


}
