import { SegmentChangeEventDetail } from '@ionic/core';
import { EventsService } from './../events.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Event } from '../event.model';

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
    offers: Event[];
    private eventsSub: Subscription;
    isLoading = false;

    constructor(
        private eventsService: EventsService,
        private router: Router,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
    ) { }

    ngOnInit() {
        this.eventsSub = this.eventsService.events.subscribe(events => {
            this.offers = events;
        });
    }

    ionViewWillEnter() {
        this.isLoading = true;
        this.eventsService.fetchEvents().subscribe(() => {
            this.isLoading = false;
        });
    }

    onEdit(offerId: string, slidingItem: IonItemSliding) {
        slidingItem.close();
        this.router.navigate(['/', 'events', 'tabs', 'offers', 'edit', offerId])
        console.log('Editing item', offerId)
    }

    sendCancellationEmail() {
    }

    onCancel(eventId: string, slidingItem: IonItemSliding) {
        slidingItem.close();

        this.alertCtrl.create({
            header: 'Are you sure?',
            message: 'This action will cancel the event and notify all participants by email.',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        this.router.navigate(['/events/tabs/offers'])
                    }
                },
                {
                    text: 'Confirm',
                    cssClass: 'delete',
                    handler: () => {
                        this.loadingCtrl.create({
                            message: 'Canceling...'
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.eventsService.cancelEvent(eventId).subscribe(() => {
                                loadingEl.dismiss();
                            });
                        })
                    }
                }
            ]
        }).then(alertEl => alertEl.present());

    }

    ngOnDestroy() {
        if (this.eventsSub) {
            this.eventsSub.unsubscribe();
        }
    }

}
