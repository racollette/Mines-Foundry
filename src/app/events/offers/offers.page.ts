import { SegmentChangeEventDetail } from '@ionic/core';
import { EventsService } from './../events.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


//import { EmailComposer } from '@ionic-native/email-composer/ngx';
//import { Email } from '@teamhive/capacitor-email';

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
        //private emailComposer: EmailComposer
        //private email: Email
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

    // sendCancellationEmail() {
    //     const email = new Email();

    //     const hasPermission = email.hasPermission();

    //     if (!hasPermission) {
    //         email.requestPermission();
    //     }

    //     const available = email.isAvailable({
    //         alias: 'gmail' // gmail, outlook, yahoo *optional*,
    //     });

    //     // available.hasAccount  *If email is setup*
    //     // available.hasApp  *If device has alias supplied*

    //     if (available) {
    //         email.open({
    //             to: ['racollette@gmail.com'],
    //             subject: 'Party',
    //             body: 'Hi bring drinks...',
    //             isHtml: false
    //         })

    //     }
    // }

    // sendCancellationEmail() {
    //     this.emailComposer.isAvailable().then((available: boolean) => {
    //         if (available) {
    //             //Now we know we can send
    //         }
    //     });

    //     let email = {
    //         to: 'racollette@gmail.com',
    //         subject: 'Cordova Icons',
    //         body: 'How are you? Nice greetings from Leipzig',
    //         isHtml: true
    //     }

    //     // Send a text message using default options
    //     this.emailComposer.open(email);
    // }

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
                                //this.sendCancellationEmail();
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
