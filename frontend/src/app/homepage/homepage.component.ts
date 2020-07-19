import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { baseURL } from "../shared/baseurl";
import { Router, ActivatedRoute, ParamMap, NavigationExtras } from '@angular/router';
import { RealEstateSearchService } from '../services/real-estate-search.service';
import { databaseValuesToSerbian } from '../shared/dictionary';
import { UserService } from '../services/user.service';
import { NotificationsService } from 'angular2-notifications';

let navigationExtras: NavigationExtras

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})

export class HomepageComponent implements OnInit {

  slideIndex: number = 0;

  impressions: Array<string> = ["Traženje stana preko GLIAgency bilo je veoma zanimljivo iskustvo koje je kratko trajalo " +
    "budući da sam stan koji mi odgovara pronašla brže nego što sam očekivala. " +
    "Posebno bih pohvalila ljubaznost i profesionalizam zaposlenih.",
  "Zadovoljan sam saradnjom sa GLIAgency jer su mi pomogli u pripremi dokumentacije. " +
  "Takođe, ispoštovano je vreme koje mi je odgovaralo za razgledanje nekretnine od strane klijenata.",
  "Zahvaljujući filterima na sajtu uspela sam da za vrlo kratko vreme pronađem stan po svojoj meri. " +
  "Online prezentacija prikazuje puna detalja, tako da na samom razgledanju nije bilo neprijatnih iznenađenja. " +
  "Sve pohvale za ovakav profesionalni pristup.",
  "Istog dana kada se oglas za iznajmljivanje mog stana pojavio na stranici agencije " +
  "online agent me je kontaktirao i zakazao upoznavanje sa zainteresovanim zakupcima. " +
  "Stan sam izdao u rekordnom roku. " +
  "Moja topla preporuka za ovu agenciju."]
  cooperation: string;

  constructor(
    public userService: UserService,
    private searchResults: RealEstateSearchService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private notificationsService: NotificationsService) {
  }

  ngOnInit() {
  }

  changeSlide(n: number) {
    this.slideIndex = this.slideIndex + n;
    if (this.slideIndex === this.impressions.length) {
      this.slideIndex = 0
    }
    if (this.slideIndex === -1) {
      this.slideIndex = this.impressions.length - 1
    }
  }

  searchForRealEstate() {
    var searchInput = (document.getElementById("search-input-id") as HTMLInputElement).value;

    if (searchInput == "") {
      (document.getElementById("search-input-id") as HTMLInputElement).setAttribute('placeholder', "Molimo unesite ID nekretnine ili naziv ulice")
      return
    }

    if (!isNaN(Number(searchInput))) {
      (document.getElementById("search-input-id") as HTMLInputElement).value = ""
      this.router.navigate(['/advertisement', searchInput]);
      return
    }

    const urlParameters = Object.assign({}, this.route.snapshot.queryParams);
    let getRequestURL = baseURL.concat('real-estate-list/quick-search?')

    /* Note: Value is bg or ns (for now) */
    var city = (document.getElementById("search-select-id") as HTMLInputElement).value;

    if (city !== 'Izaberite grad') {
      urlParameters['city-id'] = city
      getRequestURL = getRequestURL.concat('city=', city);
    }
    else {
      (document.getElementById("city-id-error") as HTMLInputElement).innerHTML = "Molimo izaberite grad"
      return
    }

    let queryInput = searchInput.split(" ").join("%20");
    getRequestURL = getRequestURL.concat('&q=', queryInput)

    urlParameters['street-id'] = searchInput

    /* Note: Value is sale or rent*/
    var cooperation = (document.querySelector('input[name="city-selection"]:checked') as HTMLInputElement).value;
    getRequestURL = getRequestURL.concat('&cooperation=', cooperation)
    urlParameters['cooperation'] = cooperation

    getRequestURL = getRequestURL.concat('&userId=', this.userService.getId());

    (document.getElementById("search-input-id") as HTMLInputElement).value = ""
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
  }


  redirectTo(uri: string, navigationExtras: NavigationExtras) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri], navigationExtras));
  }
  onChangeCity(value) {
    (document.getElementById("city-id-error") as HTMLInputElement).innerHTML = ""
  }

}
