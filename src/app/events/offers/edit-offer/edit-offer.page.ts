import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Event } from '../../event.model';
import { EventsService } from '../../events.service';

@Component({
    selector: 'app-edit-offer',
    templateUrl: './edit-offer.page.html',
    styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
    event: Event;
    eventId: string;
    private eventSub: Subscription;
    form: FormGroup;
    isLoading = false;

    constructor(
        private eventsService: EventsService,
        private navCtrl: NavController,
        private route: ActivatedRoute,
        private router: Router,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('eventId')) {
                this.navCtrl.navigateBack('/events/tabs/offers');
                return
            }
            this.eventId = paramMap.get('eventId')
            this.isLoading = true;
            this.eventSub = this.eventsService.getEvent(paramMap.get('eventId')).subscribe(event => {
                this.event = event;
                this.form = new FormGroup({
                    title: new FormControl(this.event.title, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                    description: new FormControl(this.event.description, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(180)]
                    })
                });
              this.isLoading = false;
            }, error => {
              this.alertCtrl.create({
                header: 'An error occurred!',
                message: 'Event could not be fetched. Please try again later',
                buttons: [{text: 'Okay', handler: () => {
                  this.router.navigate(['/events/tabs/offers'])
                }}]
              }).then(alertEl => {
                alertEl.present();
              })
            });

        });
    }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Updating event...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.eventsService
          .updateEvent(
            this.event.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/events/tabs/offers']);
          });
      });
  }

    ngOnDestroy() {
        if (this.eventSub) {
            this.eventSub.unsubscribe();
        }
    }

}
