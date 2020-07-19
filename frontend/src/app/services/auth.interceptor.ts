import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { AuthorisationService } from './auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// intercept original request and add authorisation token to header
@Injectable()
export class AuthorisationInterceptor implements HttpInterceptor {
  constructor(private inj: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authorisationService = this.inj.get(AuthorisationService);
    const authToken = authorisationService.getToken();
    const authReq = req.clone({headers: req.headers.set('Authorization', 'bearer ' + authToken)});
    return next.handle(authReq);
  }
}

// interceptor which desrtroys credentials afther unauthorised request caused by invalid token
@Injectable()
export class InvalidTokenInterceptor implements HttpInterceptor {
  constructor(private inj: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authorisationService = this.inj.get(AuthorisationService);
    const authToken = authorisationService.getToken();

    return next
      .handle(req)
      .pipe(tap((event: HttpEvent<any>) => {
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 && authToken && err.error.statusMessage === 'Token nije validan!') {
            authorisationService.destroyUserCredentials();
          }
        }
      }));
  }
}
