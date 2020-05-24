import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription, from } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { Calendar } from '@ionic-native/calendar/ngx';

import { EventsService } from '../../events.service';
import { Event } from '../../event.model';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';

import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.page.html',
    styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit, OnDestroy {
    event: any;
    eventId: string;
    isBookable = true;
    isLoading = false;
    email: string;
    private eventSub: Subscription;

    constructor(
        private navCtrl: NavController,
        private route: ActivatedRoute,
        private eventsService: EventsService,
        private modalCtrl: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private bookingService: BookingService,
        private loadingCtrl: LoadingController,
        private authService: AuthService,
        private alertCtrl: AlertController,
        private router: Router,
        private calendar: Calendar
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('eventId')) {
                this.navCtrl.navigateBack('/events/tabs/discover');
                return
            }
            this.eventId = paramMap.get('eventId')
            this.isLoading = true;
            this.eventSub = this.eventsService.getEvent(paramMap.get('eventId')).subscribe(event => {
                this.event = event;
                this.isLoading = false;
            }, error => {
                this.alertCtrl.create({
                    header: 'An error occurred!',
                    message: 'Event could not be fetched. Please try again later',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['/events/tabs/discover'])
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                })
            });

        });
    }

    ionViewWillEnter() {
        this.email = this.authService._email
    }

    onSignup(slot: number) {
        this.openSignupModal(slot);
    }

    calendarEvent(event, action: string) {
        const eventLocation = "Mines Foundry in Hill Hall";
        let day = event.day.slice(0, 10)
        let startTime = event.startTime.slice(10)
        let endTime = event.endTime.slice(10)
        const eventStart = new Date(day.concat(startTime))
        const eventEnd = new Date(day.concat(endTime))

        if (action == "add") {
            const checkExistingSignups = event.participants.filter(user => user.email == this.email)
            if (checkExistingSignups.length > 1) return
            this.calendar.createEvent(event.title, eventLocation, event.description, new Date(eventStart), new Date(eventEnd));
        }

        if (action == "delete") {
            const checkExistingSignups = event.participants.filter(user => user.email == this.email)
            if (checkExistingSignups.length > 0) return
            this.calendar.deleteEvent(event.title, eventLocation, event.description, new Date(eventStart), new Date(eventEnd));
        }
    }

    openSignupModal(slot: number) {
        this.modalCtrl.create({
            component: CreateBookingComponent,
            componentProps: { selectedEvent: this.event }
        })
            .then(modelEl => {
                modelEl.present();
                return modelEl.onDidDismiss();
            })
            .then(resultData => {

                const email = this.authService._email

                if (resultData.role === 'confirm') {
                    this.loadingCtrl.create({
                        message: 'Reserving slot..'
                    }).then(loadingEl => {
                        loadingEl.present();
                        const data = resultData.data.bookingData;
                        this.eventsService.registerForEvent(
                            this.event.id,
                            data.firstName,
                            data.lastName,
                            email,
                            slot
                        ).subscribe((events) => {
                            this.event = events
                            this.calendarEvent(this.event, 'add')
                            loadingEl.dismiss();

                        });
                    })
                }

            });
    }

    cancelSignup(slot: number) {
        this.loadingCtrl.create({
            message: 'Canceling reservation..'
        }).then(loadingEl => {
            loadingEl.present();
            this.eventsService.registerForEvent(
                this.event.id,
                '',
                '',
                '',
                slot
            ).subscribe((events) => {
                this.event = events
                this.calendarEvent(this.event, 'delete')
                loadingEl.dismiss()
            });
        })
    }

    // onBookEvent() {
    //     //this.router.navigateByUrl('/events/tabs/discover')
    //     //this.navCtrl.navigateBack('/events/tabs/discover');
    //     //this.navCtrl.pop();

    //     this.actionSheetCtrl.create({
    //         header: 'Choose an action',
    //         buttons: [
    //             {
    //                 text: 'Select Date',
    //                 handler: () => {
    //                     this.openBookingModal('select');
    //                 }
    //             },
    //             {
    //                 text: 'Random Date',
    //                 handler: () => {
    //                     this.openBookingModal('random');
    //                 }
    //             },
    //             {
    //                 text: 'Cancel',
    //                 role: 'cancel'
    //             }
    //         ]
    //     }).then(actionSheetEl => {
    //         actionSheetEl.present();
    //     })
    // }

    // openBookingModal(mode: 'select' | 'random') {
    //     console.log(mode);
    //     this.modalCtrl.create({
    //         component: CreateBookingComponent,
    //         componentProps: { selectedEvent: this.event, selectedMode: mode }
    //     })
    //         .then(modelEl => {
    //             modelEl.present();
    //             return modelEl.onDidDismiss();
    //         })
    //         .then(resultData => {

    //             if (resultData.role === 'confirm') {
    //                 this.loadingCtrl.create({
    //                     message: 'Booking event..'
    //                 }).then(loadingEl => {
    //                     loadingEl.present();
    //                     const data = resultData.data.bookingData;
    //                     this.bookingService.addBooking(
    //                         this.event.id,
    //                         this.event.title,
    //                         this.event.imageUrl1,
    //                         data.firstName,
    //                         data.lastName,
    //                         data.guestNumber,
    //                         data.startDate,
    //                         data.endDate
    //                     ).subscribe(() => {
    //                         loadingEl.dismiss();
    //                     });
    //                 })

    //             }
    //         });
    // }

    ngOnDestroy() {
        if (this.eventSub) {
            this.eventSub.unsubscribe();
        }
    }

}
