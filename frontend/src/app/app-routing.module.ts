import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomepageComponent } from './homepage/homepage.component';
import { RealEstateListComponent } from './real-estate-list/real-estate-list.component';
import { AdvertisementComponent } from './advertisement/advertisement.component';
import { ProfileComponent } from './profile/profile.component';
import { AgentsComponent } from './agents/agents.component';
import { RealEstateProcessingComponent } from './real-estate-processing/real-estate-processing.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AddRealEstateComponent } from './add-real-estate/add-real-estate.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { AuthGuardAgent, AuthGuardUser, SupportChatGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'real-estate-list', component: RealEstateListComponent },
  { path: 'advertisement/:id', component: AdvertisementComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'agents', component: AgentsComponent },
  { path: 'offeredRealEstate', component: RealEstateProcessingComponent, canActivate: [AuthGuardAgent] },
  { path: 'offersInProgress', component: RealEstateProcessingComponent, canActivate: [AuthGuardAgent] },
  { path: 'support-chat', component: SupportChatComponent, canActivate: [AuthGuardAgent], canDeactivate: [SupportChatGuard] },
  { path: 'add-real-estate', component: AddRealEstateComponent, canActivate: [AuthGuardAgent] },
  { path: 'favorites', component: FavoritesComponent /*, canActivate: [AuthGuardUser] */ }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
