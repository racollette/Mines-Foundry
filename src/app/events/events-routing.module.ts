import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsPage } from './events.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: EventsPage,
        children: [
            {
                path: 'discover', children: [
                    {
                        path: '',
                        loadChildren: () => import('./discover/discover.module').then(m => m.DiscoverPageModule)
                    },
                    {
                        path: ':eventId',
                        loadChildren: () => import('./discover/event-detail/event-detail.module').then(m => m.EventDetailPageModule)
                    }
                ]

            },
            {
                path: 'offers', children: [
                    {
                        path: '',
                        loadChildren: () => import('./offers/offers.module').then(m => m.OffersPageModule)
                    },
                    {
                        path: 'new',
                        loadChildren: () => import('./offers/new-offer/new-offer.module').then(m => m.NewOfferPageModule)
                    },
                    {
                        path: 'edit/:eventId',
                        loadChildren: () => import('./offers/edit-offer/edit-offer.module').then(m => m.EditOfferPageModule)
                    }
                  
                ]

            },
            {
                path: 'information', children: [
                    {
                        path: '',
                        loadChildren: () => import('./information/information.module').then(m => m.InformationPageModule)
                    }
                  
                ]
            },
            {
                path: '',
                redirectTo: '/events/tabs/discover',
                pathMatch: 'full'
            }

        ]
    },
    {
        path: '',
        redirectTo: '/events/tabs/discover',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EventsPageRoutingModule { }
