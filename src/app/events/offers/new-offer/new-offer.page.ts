import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { EventsService } from '../../events.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss']
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      slots: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      day: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      startTime: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      endTime: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }

  onCreateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating event...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.eventsService
          .addEvent(
            this.form.value.title,
            this.form.value.description,
            +this.form.value.slots,
            new Date(this.form.value.day),
            this.form.value.startTime,
            this.form.value.endTime
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/events/tabs/offers']);
          });
      });
  }
}
