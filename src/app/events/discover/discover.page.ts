import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { EventsService } from '../events.service';
import { Event } from '../event.model';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-discover',
    templateUrl: './discover.page.html',
    styleUrls: ['./discover.page.scss']
})
export class DiscoverPage implements OnInit, OnDestroy {
    loadedEvents: Event[];
    listedLoadedEvents: Event[];
    relevantEvents: Event[];
    isLoading = false;
    private eventsSub: Subscription;
    slots: boolean = true;

    constructor(
        private eventsService: EventsService,
        private menuCtrl: MenuController,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.eventsSub = this.eventsService.events.subscribe(events => {
            this.loadedEvents = events;
            this.relevantEvents = this.loadedEvents
            this.listedLoadedEvents = this.relevantEvents.slice(1);
        });
    }

    ionViewWillEnter() {
        this.isLoading = true;
        this.eventsService.fetchEvents().subscribe((events) => {
            console.log(events)

            events.forEach(event => {
                let signups = event.participants.filter(signups => signups.firstName !== "").length
                event.slotsOpen = event.slots - signups
            })

            this.relevantEvents = this.loadedEvents.filter(event => event.day > new Date)
            this.listedLoadedEvents = this.relevantEvents.slice(1);
            this.isLoading = false;
        });
    }

    onOpenMenu() {
        this.menuCtrl.toggle();
    }

    onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
        this.authService.userId.pipe(take(1)).subscribe(userId => {
            let now = new Date
            if (event.detail.value === 'upcoming') {
                this.relevantEvents = this.loadedEvents.filter(
                    event => event.day > now
                )
                this.listedLoadedEvents = this.relevantEvents.slice(1);
            } else {
                this.relevantEvents = this.loadedEvents.filter(
                    event => event.day < now
                )
                this.listedLoadedEvents = this.relevantEvents.slice(1);
            }
        });

    }

    ngOnDestroy() {
        if (this.eventsSub) {
            this.eventsSub.unsubscribe();
        }
    }
}
