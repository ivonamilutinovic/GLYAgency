import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { RealEstateSearchService } from '../services/real-estate-search.service';
import { UserService } from '../services/user.service';
import { FavoritesService } from '../services/favorites.service';
import { baseURL } from "../shared/baseurl";
import { databaseValuesToSerbian, HTMLCheckboxIdToDatabaseValue } from '../shared/dictionary';
import { NotificationsService } from 'angular2-notifications';

interface Ad {
  id: number;
  cooperation: string;
  price: number;
  m2: number;
  street: string;
  community: string;
  struct: string;
}

interface SearchParameters {
  type: string;
  minPrice: number;
  maxPrice: number;
  minM2: number;
  maxM2: number;
  location: string;
  street: string;
  minNumberOfRooms: number;
  maxNumberOfRooms: number;
  minMounthlyExpenses: number;
  maxMounthlyExpenses: number;
}

@Component({
  selector: 'app-real-estate-list',
  templateUrl: './real-estate-list.component.html',
  styleUrls: ['./real-estate-list.component.css']
})

export class RealEstateListComponent implements OnInit {

  //searchResult: Array<Ad>;
  isCityBg = true
  searchResult: any
  cooperation: string
  state: any = {}
  navigation: any

  constructor(
    private searchResults: RealEstateSearchService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private userService: UserService,
    private favoritesService: FavoritesService,
    private notificationsService: NotificationsService) {

    let navigation = this.router.getCurrentNavigation();
    this.state = navigation.extras.state
    /* this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }; */
  }

  ngOnInit() {
    this.searchResults.getSearchResults().subscribe(result => {
      this.searchResult = result
    })

    if (this.state != undefined) {
      this.cooperation = this.state["cooperation"]
      delete this.state["cooperation"]

      this.isCityBg = this.state["city-id"] == "bg"
    }

    for (let idValue in this.state) {
      if (this.state.hasOwnProperty(idValue))
        (document.getElementById(idValue) as HTMLInputElement).value = this.state[idValue]
    }

  }

  search() {
    let getRequestURL = baseURL.concat('real-estate-list/extended-search?')

    var type = (document.getElementById("type-of-real-estate-id") as HTMLInputElement).value;
    getRequestURL = getRequestURL.concat('type=', type)
    if (this.cooperation != undefined)
      getRequestURL = getRequestURL.concat('&cooperation=', this.cooperation)

    var minPrice = (document.getElementById("min-price-id") as HTMLInputElement).value;
    if (minPrice != "")
      getRequestURL = getRequestURL.concat('&priceMin=', minPrice)

    var maxPrice = (document.getElementById("max-price-id") as HTMLInputElement).value;
    if (maxPrice != "")
      getRequestURL = getRequestURL.concat('&priceMax=', maxPrice)

    var minM2 = (document.getElementById("min-m2-id") as HTMLInputElement).value;
    if (minM2 != "")
      getRequestURL = getRequestURL.concat('&m2Min=', minM2)

    var maxM2 = (document.getElementById("max-m2-id") as HTMLInputElement).value;
    if (maxM2 != "")
      getRequestURL = getRequestURL.concat('&m2Max=', maxM2)

    var city = (document.getElementById("city-id") as HTMLInputElement).value;
    getRequestURL = getRequestURL.concat('&city=', city)

    var street = (document.getElementById("street-id") as HTMLInputElement).value;
    if (street != "") {
      let modStreet = street.split(" ").join("%20");
      getRequestURL = getRequestURL.concat('&street=', modStreet)
    }

    var minMonthlyExpenses = (document.getElementById("min-monthly-expenses-id") as HTMLInputElement).value;
    if (minMonthlyExpenses != "")
      getRequestURL = getRequestURL.concat('&monthlyExpensesMin=', minMonthlyExpenses)

    var maxMonthlyExpenses = (document.getElementById("max-monthly-expenses-id") as HTMLInputElement).value;
    if (maxMonthlyExpenses != "")
      getRequestURL = getRequestURL.concat('&monthlyExpensesMax=', maxMonthlyExpenses)

    var minFloor = (document.getElementById("min-floor-id") as HTMLInputElement).value;
    if (minFloor != "")
      getRequestURL = getRequestURL.concat('&floorMin=', minFloor)

    var maxFloor = (document.getElementById("min-floor-id") as HTMLInputElement).value;
    if (maxFloor != "")
      getRequestURL = getRequestURL.concat('&floorMax=', maxFloor)

    /* Type of object */
    let renovation = []
    var lux = (document.getElementById("lux-id") as HTMLInputElement).checked;
    if (lux === true)
      renovation.push('lux')
    var newBuilding = (document.getElementById("new-building-id") as HTMLInputElement).checked;
    if (newBuilding === true)
      renovation.push('newBuilding')
    var renovated = (document.getElementById("renovated-id") as HTMLInputElement).checked;
    if (renovated === true)
      renovation.push('renovated')
    var oldBuilding = (document.getElementById("old-building-id") as HTMLInputElement).checked;
    if (oldBuilding === true)
      renovation.push('oldBuilding')
    var underConstruction = (document.getElementById("under-construction-id") as HTMLInputElement).checked;
    if (underConstruction === true)
      renovation.push('underConstruction')
    renovation.forEach(type => {
      getRequestURL = getRequestURL.concat('&renovation[]=', type)
    });


    /* Heating */
    let heating = []
    var cg = (document.getElementById("cg-id") as HTMLInputElement).checked;
    if (cg === true)
      heating.push('cg')
    var eg = (document.getElementById("eg-id") as HTMLInputElement).checked;
    if (eg === true)
      heating.push('eg')
    var ta = (document.getElementById("ta-id") as HTMLInputElement).checked;
    if (ta === true)
      heating.push('ta')
    var gas = (document.getElementById("gas-id") as HTMLInputElement).checked;
    if (gas === true)
      heating.push('gas')
    var floatHeating = (document.getElementById("float-heating-id") as HTMLInputElement).checked;
    if (floatHeating === true)
      heating.push('floatHeating')
    var norwegianRadiators = (document.getElementById("norwegian-radiators-id") as HTMLInputElement).checked;
    if (norwegianRadiators === true)
      heating.push('norwegianRadiators')
    heating.forEach(type => {
      getRequestURL = getRequestURL.concat('&heating[]=', type)
    });

    /* Equipment */
    let furnishedArray = []
    var furnished = (document.getElementById("furnished-id") as HTMLInputElement).checked;
    if (furnished === true)
      furnishedArray.push('furnished')
    var halfFurnished = (document.getElementById("half-furnished-id") as HTMLInputElement).checked;
    if (halfFurnished === true)
      furnishedArray.push('halfFurnished')
    var unfurnished = (document.getElementById("unfurnished-id") as HTMLInputElement).checked;
    if (unfurnished === true)
      furnishedArray.push('unfurnished')
    furnishedArray.forEach(type => {
      getRequestURL = getRequestURL.concat('&furnished[]=', type)
    });

    /* Struct */
    let struct = []
    var struct0_5 = (document.getElementById("0-5-id") as HTMLInputElement).checked;
    if (struct0_5 === true)
      struct.push('0-5')
    var struct1_0 = (document.getElementById("1-0-id") as HTMLInputElement).checked;
    if (struct1_0 === true)
      struct.push('1-0')
    var struct1_5 = (document.getElementById("1-5-id") as HTMLInputElement).checked;
    if (struct1_5 === true)
      struct.push('1-5')
    var struct2_0 = (document.getElementById("2-0-id") as HTMLInputElement).checked;
    if (struct2_0 === true)
      struct.push('2-0')
    var struct2_5 = (document.getElementById("2-5-id") as HTMLInputElement).checked;
    if (struct2_5 === true)
      struct.push('2-5')
    var struct3_0 = (document.getElementById("3-0-id") as HTMLInputElement).checked;
    if (struct3_0 === true)
      struct.push('3-0')
    var struct3_5 = (document.getElementById("3-5-id") as HTMLInputElement).checked;
    if (struct3_5 === true)
      struct.push('3-5')
    var struct4_0 = (document.getElementById("4-0-id") as HTMLInputElement).checked;
    if (struct4_0 === true)
      struct.push('4-0')
    var struct4_5 = (document.getElementById("more-then-4-0-id") as HTMLInputElement).checked;
    if (struct4_5 === true)
      struct.push('4-5')
    struct.forEach(type => {
      getRequestURL = getRequestURL.concat('&struct[]=', type)
    });

    /* Additionals */
    let additionalSpace = []
    let buildingEquipment = []
    let realEstateEquipment = []
    var terrace = (document.getElementById("terrace-id") as HTMLInputElement).checked;
    if (terrace === true)
      additionalSpace.push('terrace')
    var airConditioner = (document.getElementById("air-conditioner-id") as HTMLInputElement).checked;
    if (airConditioner === true)
      realEstateEquipment.push('airConditioner')
    var elevator = (document.getElementById("elevator-id") as HTMLInputElement).checked;
    if (elevator === true)
      buildingEquipment.push('elevator')
    var basement = (document.getElementById("basement-id") as HTMLInputElement).checked;
    if (basement === true)
      additionalSpace.push('basement')
    var phone = (document.getElementById("phone-id") as HTMLInputElement).checked;
    if (phone === true)
      realEstateEquipment.push('phone')
    var katv = (document.getElementById("katv-id") as HTMLInputElement).checked;
    if (katv === true)
      realEstateEquipment.push('katv')
    var internet = (document.getElementById("internet-id") as HTMLInputElement).checked;
    if (internet === true)
      realEstateEquipment.push('internet')
    var interphone = (document.getElementById("interphone-id") as HTMLInputElement).checked;
    if (interphone === true)
      buildingEquipment.push('interphone')
    var videoSurveillance = (document.getElementById("video-surveillance-id") as HTMLInputElement).checked;
    if (videoSurveillance === true)
      buildingEquipment.push('videoSurveillance')
    var parking = (document.getElementById("parking-id") as HTMLInputElement).checked;
    if (parking === true)
      additionalSpace.push('parking')
    var garage = (document.getElementById("garage-id") as HTMLInputElement).checked;
    if (garage === true)
      additionalSpace.push('garage')

    let community = []
    let allComunnityCheckboxes = (document.querySelectorAll('.uncheck input'));
    for (let i = 0; i < allComunnityCheckboxes.length; i++) {
      if ((allComunnityCheckboxes[i] as unknown as HTMLInputElement).checked)
        community.push(HTMLCheckboxIdToDatabaseValue[allComunnityCheckboxes[i].id])
    }

    community.forEach(value => {
      getRequestURL = getRequestURL.concat('&community[]=', value)
    });
    additionalSpace.forEach(value => {
      getRequestURL = getRequestURL.concat('&additionalSpace[]=', value)
    });
    buildingEquipment.forEach(value => {
      getRequestURL = getRequestURL.concat('&buildingEquipment[]=', value)
    });
    realEstateEquipment.forEach(value => {
      getRequestURL = getRequestURL.concat('&realEstateEquipment[]=', value)
    });

    getRequestURL = getRequestURL.concat('&userId=', this.userService.getId())

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
        this.searchResult = response
      })
      .catch(console.log);

    //Go to top
    window.scroll(0, 0)

  }

  addToFavourites(number) {

    if (this.userService.getId() === undefined) {
      alert('Da bi dodali nekretninu u omiljene morate se prijaviti');
    }
    else {
      if (this.searchResult[number]["addedToFavorites"] == false) {
        // add to favorites
        this.favoritesService.addToFavorites(this.searchResult[number]._id.toString(), this.userService.getId())
          .subscribe(res => {
            this.searchResult[number]["addedToFavorites"] = true;
          },
            err => {
              if (err === 'Nekretnina je već u omiljenim')
                this.searchResult[number]["addedToFavorites"] = true;
              alert(err);
            })
      }
      else {
        // allready in favorites, delete it from favorites
        this.favoritesService.deleteFromFavorites(this.searchResult[number]._id.toString(), this.userService.getId())
          .subscribe(res => {
            this.searchResult[number]["addedToFavorites"] = false;
          },
            err => {
              if (err === 'Nekretnina nije u omiljenim')
                this.searchResult[number]["addedToFavorites"] = false;
              alert(err);
            })
      }
    }
  }

  onChangeCity(city: string): void {
    this.isCityBg = city == "bg"
    let allComunnityCheckboxes = (document.querySelectorAll('.uncheck input'));
    for (let i = 0; i < allComunnityCheckboxes.length; i++) {
      (allComunnityCheckboxes[i] as unknown as HTMLInputElement).checked = false
    }
  }
}

