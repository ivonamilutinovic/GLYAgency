import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxImageCompressService } from 'ngx-image-compress';

import { baseURL } from './shared/baseurl';

import { ChatComponent } from './chat/chat.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { FooterComponent } from './footer/footer.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SignUpComponent } from './signup/signup.component';
import { LogInComponent } from './login/login.component';
import { RealEstateListComponent } from './real-estate-list/real-estate-list.component';
import { RealEstateProcessingComponent } from './real-estate-processing/real-estate-processing.component';
import { RealEstateOfferComponent } from './real-estate-offer/real-estate-offer.component';
import { AdvertisementComponent } from './advertisement/advertisement.component';
import { HeaderComponent } from './header/header.component';
import { ProfileComponent } from './profile/profile.component';
import { AddRealEstateComponent } from './add-real-estate/add-real-estate.component';
import { AgentsComponent } from './agents/agents.component';

import { RealEstateSearchService } from './services/real-estate-search.service';
import { AuthorisationService } from './services/auth.service';
import { UserService } from './services/user.service';
import { RealEstateOfferService } from './services/real-estate-offer.service';
import { AuthorisationInterceptor, InvalidTokenInterceptor } from './services/auth.interceptor';
import { AddRealEstateService } from './services/add-real-estate.service';
import { FavoritesService } from './services/favorites.service';
import { SupportChatGuard } from './services/auth.guard'

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    SignUpComponent,
    LogInComponent,
    RealEstateOfferComponent,
    RealEstateListComponent,
    AdvertisementComponent,
    HeaderComponent,
    ProfileComponent,
    AgentsComponent,
    AddRealEstateComponent,
    AgentsComponent,
    RealEstateProcessingComponent,
    FooterComponent,
    FavoritesComponent,
    ChatComponent,
    SupportChatComponent
  ],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    { provide: 'baseURL', useValue: baseURL },
    AuthorisationService,
    UserService,
    RealEstateOfferService,
    FavoritesService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorisationInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InvalidTokenInterceptor,
      multi: true
    },
    RealEstateSearchService,
    AddRealEstateService,
    NgxImageCompressService,
    SupportChatGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
