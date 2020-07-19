import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserService } from '../services/user.service';
import { FavoritesService } from '../services/favorites.service';
import { baseURL } from "../shared/baseurl";
import { databaseValuesToSerbian} from '../shared/dictionary';

interface Ad {
  id: number;
  cooperation: string;
  price: number;
  m2: number;
  street: string;
  community: string;
  struct: string;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  addedToFavourites: Array<boolean>; 
  searchResult: any;

  constructor(    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private userService: UserService,
    private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    if(this.userService.getAdminFlag())
      this.router.navigate(['']); 
	else if(this.userService.getId()===undefined){
      this.router.navigate(['']);
      alert('Molimo, ulogujte se.');
    }
    else{
    this.favoritesService.getMyFavorites(this.userService.getId())
    .subscribe(result => {
        this.searchResult = result
        if(this.searchResult.length === 0){
          this.router.navigate(['']);
          alert('Nemate omiljene nekretnine');
        }
        else{
        this.addedToFavourites = []
          for (let realEstate of this.searchResult){
            this.addedToFavourites.push(true);
			realEstate["struct"] = databaseValuesToSerbian[realEstate["struct"]]
            realEstate["community"] = databaseValuesToSerbian[realEstate["community"]]	
		  }
        }
    },
    error =>{
      alert(error);
    })
  }
  }

  addToFavourites(number) {
    if(this.userService.getId()===undefined){
        alert('Da bi dodali nekretninu u omiljene morate se prijaviti');
    }
    else{
      if(this.addedToFavourites[number]==false){
        // add to favorites 
        this.favoritesService.addToFavorites(this.searchResult[number]._id.toString(),this.userService.getId())
        .subscribe(res => {
                  this.addedToFavourites[number]=true;
                  },
                  err => {
                  if (err === 'Nekretnina je već u omiljenim')
                    this.addedToFavourites[number]=true; 
                  alert(err);
                  })
      }
      else {
        // allready in favorites, delete it from favorites 
        this.favoritesService.deleteFromFavorites(this.searchResult[number]._id.toString(),this.userService.getId())
        .subscribe(res => {
                  this.addedToFavourites[number]=false;
                  },
                  err => {
                  if (err === 'Nekretnina nije u omiljenim')
                    this.addedToFavourites[number]=false; 
                  alert(err);
                  })
      }
    }
  }

}
