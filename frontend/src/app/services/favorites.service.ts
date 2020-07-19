import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  constructor(private httpClient: HttpClient) { }

  addToFavorites(estateId, userId){
    return this.httpClient.post(baseURL + 'favorites/addtofavorite',
      {"advertisementId" : estateId, "userId" : userId})      
      .pipe( res => {
        return res;
      },
      catchError(error => this.handleError(error)));
    }

  deleteFromFavorites(estateId, userId){
    return this.httpClient.post(baseURL + 'favorites/deletefromfavorite',
      {"advertisementId" : estateId, "userId" : userId})
      .pipe( res => {
          return res;
      },
      catchError(error => this.handleError(error)));
  }

  getMyFavorites(userId){
    return this.httpClient.get(baseURL + 'favorites/getmyfavorites/' + userId)
    .pipe(result => { 
      return result;
    },
    catchError(error => this.handleError(error)));
  }

  // function which will handle errors 
  handleError(err: HttpErrorResponse | any){
    let errorMessage: string;
    if (err.error.success!== undefined) 
      errorMessage = err.error.statusMessage;
    else if (err.name === "HttpErrorResponse"){
      if(err.error=="Unauthorized")
        errorMessage = '401: Niste prijavljeni!';
    }
    else
      errorMessage = `${err.status} - ${err.statusText || ''} ${err.message}`;

    return throwError(errorMessage);
 }



}
