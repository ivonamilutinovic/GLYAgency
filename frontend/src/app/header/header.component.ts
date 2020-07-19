import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { NotificationsService } from 'angular2-notifications';
import { RealEstateSearchService } from '../services/real-estate-search.service';
import { AuthorisationService } from "../services/auth.service";
import { baseURL } from "../shared/baseurl";
import { Router, ActivatedRoute, ParamMap, NavigationExtras } from '@angular/router';
import { databaseValuesToSerbian } from '../shared/dictionary';
import { UserService } from '../services/user.service';


let navigationExtras: NavigationExtras


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})

export class HeaderComponent implements OnInit, OnDestroy {
  email: string = undefined;
  idSubscription: Subscription;
  emailSubscription: Subscription;
  adminFlagSubscription: Subscription;
  cooperation: string;
  adminFlag: boolean = false;
  _id: string = undefined;

  constructor(
    private searchResults: RealEstateSearchService,
    private authorisationService: AuthorisationService,
    private userService: UserService,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit() {
    this.authorisationService.loadUserCredentials();
    this.emailSubscription = this.authorisationService.getEmail()
      .subscribe(name => {
        this.email = name;
        var rightDiv = document.getElementById('right-div-id');
        rightDiv.style.right = "5.3%";
      });
    this.adminFlagSubscription = this.authorisationService.getAdminFlag()
      .subscribe(flag => {
        this.adminFlag = flag;
      });
    this.idSubscription = this.authorisationService.getId()
      .subscribe(_id => {
        this._id = _id;
      });

  }

  ngOnDestroy() {
    this.emailSubscription.unsubscribe();
    this.adminFlagSubscription.unsubscribe();
    this.idSubscription.unsubscribe();
  }

  returnToInitiallyState() {
    this._closeOreNotificationDivIfOpened();
    if (window.location.pathname === '/')
      location.reload();
  }

  buy() {
    this._closeOreNotificationDivIfOpened();
    this.cooperation = "sale";
    var div = document.getElementById("brief-exploring-options-id");
    div.classList.add("active");
  }

  rent() {
    this._closeOreNotificationDivIfOpened();
    this.cooperation = "rent";
    var div = document.getElementById("brief-exploring-options-id");
    div.classList.add("active");
  }


  briefSearch() {

    let getRequestURL = baseURL.concat('real-estate-list/brief-search?')

    var div = document.getElementById("brief-exploring-options-id");
    const urlParameters = Object.assign({}, this.route.snapshot.queryParams);

    /* Note: Value is sale or rent*/
    var type = (document.getElementById("type-of-real-estate-id-header") as HTMLInputElement).value;
    urlParameters['type-of-real-estate-id'] = type
    getRequestURL = getRequestURL.concat('type=', type)

    getRequestURL = getRequestURL.concat('&cooperation=', this.cooperation)

    /* Note: Value is bg or ns */
    var city = (document.getElementById("city-id-header") as HTMLInputElement).value;
    urlParameters['city-id'] = city
    getRequestURL = getRequestURL.concat('&city=', city)

    var maxPrice = (document.getElementById("max-price-id-header") as HTMLInputElement).value;
    if (maxPrice != "") {
      urlParameters['max-price-id'] = maxPrice
      getRequestURL = getRequestURL.concat('&priceMax=', maxPrice)
    }

    var minArea = (document.getElementById("min-m2-id-header") as HTMLInputElement).value;
    if (minArea != "") {
      urlParameters['min-m2-id'] = minArea
      getRequestURL = getRequestURL.concat('&m2Min=', minArea)
    }
    urlParameters['cooperation'] = this.cooperation

    getRequestURL = getRequestURL.concat('&userId=', this.userService.getId());

    (document.getElementById("min-m2-id-header") as HTMLInputElement).value = "";
    (document.getElementById("max-price-id-header") as HTMLInputElement).value = ""

    this.httpClient.get(getRequestURL)
      .toPromise()
      .then((response: []) => {
        if (response.length == 0) {
          this.notificationsService.success("Server poruka", "Ne postoji nekretnina u bazi koja ispunjava unete parametre ", {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        }
        response.forEach(realEstate => {
          realEstate["struct"] = databaseValuesToSerbian[realEstate["struct"]]
          realEstate["community"] = databaseValuesToSerbian[realEstate["community"]]
        });
        this.searchResults.setSearchResults(response);
      })
      .catch(console.log);

    navigationExtras = { state: urlParameters }
    this.redirectTo('/real-estate-list', navigationExtras)

    div.classList.remove("active");
    /*  console.log(
       this.cooperation +
       " " +
       type +
       " " +
       maxPrice +
       " " +
       minArea +
       " " +
       city
     ); */
  }

  agents() {
    this._closeOreNotificationDivIfOpened();
    this._closeBriefExploringOptionsDivIfOpened();
  }

  redirectTo(uri: string, navigationExtras: NavigationExtras) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri], navigationExtras));
  }

  offerRealEstate() {
    this._closeBriefExploringOptionsDivIfOpened();
    var form = document.getElementById("offer-real-estate-id");
    var overlay = document.getElementById("overlay");
    form.classList.add("active");
    overlay.classList.add("active");
  }

  /* Function checks if the user is currently logged in */
  isLogIn() {
    if (!this.authorisationService.isLoggedIn()) {
      this._closeBriefExploringOptionsDivIfOpened();
      var oreLoginNontification = document.getElementById("ore-login-notification-id");
      oreLoginNontification.style.display = "block";
      return false;
    } else
      return true;
  }

  oreClose() {
    this._closeOreNotificationDivIfOpened()
  }

  logInForm(element: string) {
    this._closeOreNotificationDivIfOpened();
    this._closeBriefExploringOptionsDivIfOpened();
    var form = document.getElementById(element);
    var overlay = document.getElementById("overlay");
    form.classList.add("active");
    overlay.classList.add("active");
    this.oreClose();
  }

  logOut() {
    this._closeBriefExploringOptionsDivIfOpened();
    this.email = undefined;
    this.authorisationService.logOut();
    var rightDiv = document.getElementById('right-div-id');
    rightDiv.style.right = "0%";
  }

  _closeBriefExploringOptionsDivIfOpened() {
    var briefExploringOptions = document.getElementById("brief-exploring-options-id");
    briefExploringOptions.classList.remove("active");
  }

  _closeOreNotificationDivIfOpened() {
    var oreLoginNontification = document.getElementById("ore-login-notification-id");
    if (oreLoginNontification.style.display == 'block')
      oreLoginNontification.style.display = 'none';
  }
}
