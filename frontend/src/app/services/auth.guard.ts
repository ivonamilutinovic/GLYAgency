import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { SupportChatComponent } from '../support-chat/support-chat.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardAgent implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  //Admin (agent) role
  //The route can be activated by logged in agents
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    {
      if (this.userService.getAdminFlag()) {
        return true;
      } else {
        this.router.navigate([""]);
        return false;
      }
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuardUser implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  //User role
  //The route can be activated by logged in users
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    {
      if (this.userService.getAdminFlag() == false
        && this.userService.getId() != "undefined" && this.userService.getId() != undefined) {
        return true;
      } else {
        this.router.navigate([""]);
        return false;
      }
    }
  }
}

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class SupportChatGuard implements CanDeactivate<CanComponentDeactivate> {

  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

}
