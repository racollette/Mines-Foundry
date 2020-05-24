import { Component, OnInit, Input } from '@angular/core';
import { Event } from '../../event.model';

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss'],
})
export class OfferItemComponent implements OnInit {
  @Input() offer: Event;

  constructor() { }

  ngOnInit() {}


}
