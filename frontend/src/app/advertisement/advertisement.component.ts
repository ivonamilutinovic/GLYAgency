import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ActivatedRoute } from '@angular/router';
import { databaseValuesToSerbian } from '../shared/dictionary';
import { RealEstateSearchService } from '../services/real-estate-search.service';
import { UserService } from "../services/user.service";
import { FavoritesService } from '../services/favorites.service';
import { NotificationsService } from 'angular2-notifications';

// interface Dict{
//   key: string,
//   value: boolean
// }

// interface Ad{
//   /* Elementary informations */
//   id: number;
//   cooperation: string;
//   price: number;
//   m2: number;
//   street: string;
//   community: string;
//   struct: string;

//   /* Additional informations */
//   furnished: string;
//   heating: string;
//   floor: number;
//   total_number_of_floors: number; /* (*) */
//   year_of_building: number; /* (*) */
//   renovation: string;
//   distance_from_center_of_city: number; /* in km */ /* (*) */
//   parking: Array<string>;
//   additional_space: Array<string>;

//   description: string; /* (*) */

//   deposit: number; /* (*) */
//   minimum_renting_period: number; /* number of months */ /* (*) */
//   payment_period: string; /* for example: monthly, yearly... */ /* (*) */
//   ready_to_move_in: string; /* for example: now, some date, for couple of weeks, months... */
//   pets: Array<string>; /* list of allowed pets */

//   infostan_costs: number; /* (**) */
//   katv_and_internet_costs: number; /* -1 if property does not exists */ /* (**) */
//   property_tax_cost: number; /* -1 if property does not exists */ /* (**) */
//   heating_costs: number; /* (**) */
//   eletricity_costs: string; /* (**) */
//   /* (**) - search by total additional monthly costs */

//   real_estate_equipment: Array<Dict>; /* Internet Kablovska Francuski krevet Krevet singl Klima Frižider Zamrzivač Frižider sa zamrživačem Šporet Rerna Veš mašina Tuš kabina Kada za kupanje Mašina za sudove Televizor Telefon Mašina za sušenje veša Alarm */
//   building_equipment: Array<Dict>; /* Lift Interfon Sigurnosne kamere Obezbeđenje Rampa za invalidska kolica*/

//   /* (*) - there is no search by this characteristic */
// }

@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.css']
})

export class AdvertisementComponent implements OnInit {

  //ad: Ad;
  addedToFavourites: boolean; // this will be removed atfer changing of search endpoints on server
  ad: any = {};
  _time_array: Array<string>;
  _day_array: Array<number>;
  _month_array: Array<string>;
  _year_array: Array<number>;
  _date: any;
  slideIndex: number = 0;
  cooperation: string

  serbianSingleValues = ["struct", "furnished", "heating", "renovation", "paymentPeriod", "electricityCosts",
    "cooperation", "type", "city", "community"]
  serbianArrayValues = ["parking", "additionalSpace", "pets"]
  serbianDictionaryKeys = ["realEstateEquipment", "buildingEquipment"]

  constructor(
    private adResult: RealEstateSearchService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private userService: UserService,
    private favoritesService: FavoritesService,
    private notificationsService: NotificationsService) {

    this._time_array = ["8.00", "8.30",
      "9.00", "9.30",
      "10.00", "10.30",
      "11.00", "11.30",
      "12.00", "12.30",
      "13.00", "13.30",
      "14.00", "14.30",
      "15.00", "15.30",
      "16.00", "16.30",
      "17.00", "17.30",
      "18.00", "18.30",
      "19.00", "19.30",
      "20.00", "20.30",
      "21.00"];

    this._date = new Date();
    this._day_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    this._month_array = ["Januar", "Februar", "Mart", "April", "Maj", "Jun",
      "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    this._year_array = [this._date.getFullYear(), this._date.getFullYear() + 1];
  }

  ngOnInit(): void {
    this.getRealEstate()
  }

  ngAfterViewInit(): void {
  }

  getRealEstate() {
    var id = this.route.snapshot.params['id'];
    this.http.get(baseURL + 'advertisement/' + id + '/' + this.userService.getId()).subscribe(result => {
      this.cooperation = result["cooperation"]
      for (let key in result) {
        if (this.serbianSingleValues.includes(key)) {
          this.ad[key] = databaseValuesToSerbian[result[key]]
        }
        else if (this.serbianArrayValues.includes(key)) {
          this.ad[key] = []
          for (let element in result[key]) {
            (this.ad[key]).push(databaseValuesToSerbian[result[key][element]])
          }
        }
        else if (this.serbianDictionaryKeys.includes(key)) {
          this.ad[key] = []
          for (let subKey in result[key]) {
            (this.ad[key]).push({ "key": databaseValuesToSerbian[subKey], "value": result[key][subKey] })
          }
        }
        else {
          (this.ad)[key] = result[key]
        }
      }
    }
    )
    /*this.http.get<Ad>(baseURL + 'users/' + id)
       .subscribe(result => {
        this.ad = {id: result.id, cooperation: result.cooperation, price: result.price, m2: result.m2,
        street: result.street, community: result.community, struct: result.struct,
        furnished: result.furnished, heating: result.heating, floor: result.floor, total_number_of_floors: result.total_number_of_floors,
        year_of_building: result.year_of_building, renovation: result.renovation,
        distance_from_center_of_city: result.distance_from_center_of_city,
        parking: result.parking,
        additional_space: result.additional_space,
        description: result.description,
        deposit: result.deposit,
        minimum_renting_period: result.minimum_renting_period,
        payment_period: result.payment_period,
        ready_to_move_in: result.ready_to_move_in,
        pets: result.pets,
        infostan_costs: result.infostan_costs,
        katv_and_internet_costs: result.katv_and_internet_costs,
        property_tax_cost: result.property_tax_cost,
        heating_costs: result.heating_costs,
        eletricity_costs: result.eletricity_costs,
        real_estate_equipment: result.real_estate_equipment,
        building_equipment: result.building_equipment}
      },
      err => {
        console.log(err);
      })     */
  }

  changeSlide(n: number) {
    this.slideIndex = this.slideIndex + n;
    if (this.slideIndex === this.ad.images.length) {
      this.slideIndex = 0
    }
    if (this.slideIndex === -1) {
      this.slideIndex = this.ad.images.length - 1
    }
  }

  makeAppointment() {
    var day = (document.getElementById("day") as HTMLInputElement).value;
    var month = (document.getElementById("month") as HTMLInputElement).value;
    var year = (document.getElementById("year") as HTMLInputElement).value;
    var time = (document.getElementById("time") as HTMLInputElement).value;
    let userId = this.userService.getId()
    if (userId == undefined) {
      alert("Molimo ulogujte se kako biste zakazali gledanje ")
      return;
    }

    let hoursAndMinutes = time.split('.')
    const inputDate = new Date(Number(year), this._month_array.indexOf(month), Number(day),
      Number(hoursAndMinutes[0]), Number(hoursAndMinutes[1]), 0, 0)
    if (!this.isDateValid(inputDate)) {
      this.notificationsService.info("Loš datum", "Datum zakazivanja mora biti najranije 24 časa od trenutka zakazivanja", {
        timeOut: 5000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true
      })
      return
    }

    const appointmentObjectRequest = {
      "day": day,
      "month": month,
      "year": year,
      "time": time,
      "realEstateId": this.ad["_id"],
      "userId": userId
    }
    this.http.post(baseURL + "advertisement/make-appointment", appointmentObjectRequest)
      .subscribe(result => {
        if (result["success"]) {
          this.notificationsService.success("Server poruka", result["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        }
        else {
          this.notificationsService.info("Server poruka", result["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          })
        }
      }, error => {
        this.notificationsService.alert("Server poruka", error.error.message, {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true
        })
      })
  }

  dateListener(arg: string) {
    var day = parseInt((document.getElementById("day") as HTMLInputElement).value);
    var month = (document.getElementById("month") as HTMLInputElement).value;
    var year = parseInt((document.getElementById("year") as HTMLInputElement).value);
    const _const_month_array = ["Januar", "Februar", "Mart", "April", "Maj", "Jun",
      "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    const _const_day_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

    if (arg === 'day') {
      if (day === 31) {
        this._month_array = _const_month_array.filter((value, index) => [0, 2, 4, 6, 7, 9, 11].includes(index))
      } else if (day === 30 || (day === 29 && !this._leap_year(year)))
        this._month_array = _const_month_array.filter((value, index) => index !== 1);
      else if ((day === 29 && this._leap_year(year)) || (day < 29))
        this._month_array = _const_month_array;
    } else if (arg === 'month') {
      if (_const_month_array.filter((value, index) => [0, 2, 4, 6, 7, 9, 11].includes(index)).includes(month))
        this._day_array = _const_day_array;
      else if (_const_month_array.filter((value, index) => [3, 5, 8, 10].includes(index)).includes(month))
        this._day_array = _const_day_array.filter(value => value < 31);
      else if (month === _const_month_array[1] && this._leap_year(year))
        this._day_array = _const_day_array.filter(value => value < 30);
      else if (month === _const_month_array[1] && !this._leap_year(year))
        this._day_array = _const_day_array.filter(value => value < 29);
    } else if (arg === 'year') {
      if (!this._leap_year(year) && month === 'Februar')
        this._day_array = _const_day_array.filter(value => value < 29);
      else if (!this._leap_year(year) && day === 29)
        this._month_array = _const_month_array.filter((value, index) => index !== 1);
      else {
        this._day_array = _const_day_array;
        this._month_array = _const_month_array;
      }
    }
  }

  _leap_year(n: number): boolean {
    if (((n % 4 === 0) && (n % 100 !== 0)) || (n % 400 === 0))
      return true;
    else
      return false;
  }

  _getMonthName(n: number): string {
    return this._month_array[n];
  }

  addToFavourites() {


    if (this.userService.getId() === undefined) {
      alert('Da bi dodali nekretninu u omiljene morate se prijaviti');
    }
    else {
      if (this.ad.addedToFavorites == false) {
        // add to favorites
        this.favoritesService.addToFavorites(this.ad._id.toString(), this.userService.getId())
          .subscribe(res => {
            this.ad.addedToFavorites = true;
          },
            err => {
              if (err === 'Nekretnina je već u omiljenim')
                this.ad.addedToFavorites = true;
              alert(err);
            })
      }
      else {
        // allready in favorites, delete it from favorites
        this.favoritesService.deleteFromFavorites(this.ad._id.toString(), this.userService.getId())
          .subscribe(res => {
            this.ad.addedToFavorites = false;
          },
            err => {
              if (err === 'Nekretnina nije u omiljenim')
                this.ad.addedToFavorites = false;
              alert(err);
            })
      }
    }
  }

  isDateValid(inputDate: Date) {
    let firstValidDate: Date = new Date()
    firstValidDate.setTime(Date.now() + (24 * 60 * 60 * 1000));
    return inputDate > firstValidDate;
  }

}
