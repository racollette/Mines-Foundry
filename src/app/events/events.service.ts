import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Event } from './event.model';
import { AuthService } from '../auth/auth.service';

interface EventData {
    startTime: string;
    endTime: string;
    description: string;
    imageUrl1: string;
    imageUrl2: string;
    price: number;
    slots: number;
    day: string;
    title: string;
    userId: any;
    participants: any;
}

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private _events = new BehaviorSubject<Event[]>([]);
    // ([
    //     new Event(
    //         'p1',
    //         'Manhattan Mansion',
    //         'In the heart of New York City.',
    //         'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
    //         149.99,
    //         new Date('2019-01-01'),
    //         new Date('2019-12-31'),
    //         'xyz'
    //     ),
    //     new Event(
    //         'p2',
    //         "L'Amour Toujours",
    //         'A romantic event in Paris!',
    //         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
    //         189.99,
    //         new Date('2019-01-01'),
    //         new Date('2019-12-31'),
    //         'abc'
    //     ),
    //     new Event(
    //         'p3',
    //         'The Foggy Palace',
    //         'Not your average city trip!',
    //         'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
    //         99.99,
    //         new Date('2019-01-01'),
    //         new Date('2019-12-31'),
    //         'abc'
    //     )
    // ]);

    private freePourThumbnails = [
        '../../assets/images/stock1.jpg',
         '../../assets/images/stock2.jpg'
    ]
    
    private freePourPics = [
        '../../assets/images/foundry1.jpg', 
        '../../assets/images/foundry2.jpg', 
        '../../assets/images/foundry3.jpg', 
        '../../assets/images/foundry4.jpg', 
        '../../assets/images/foundry5.jpg'
    ]

    private avatars = [
        '../../assets/images/avatar1.png', 
        '../../assets/images/avatar2.png', 
        '../../assets/images/avatar3.png', 
        '../../assets/images/avatar4.png', 
        '../../assets/images/avatar5.png',
        '../../assets/images/avatar6.png', 
        '../../assets/images/avatar7.png', 
        '../../assets/images/avatar8.png',
        '../../assets/images/avatar9.png'
    ]

    get events() {
        return this._events.asObservable();
    }

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) { }

    fetchEvents() {
        return this.http.get<{ [key: string]: EventData }>('https://mines-foundry.firebaseio.com/offered-events.json')
            .pipe(map(resData => {
                console.log(resData)
                const events = [];
                for (const key in resData) {
                    if (resData.hasOwnProperty(key)) {
                        events.push(new Event(
                            key,
                            resData[key].title,
                            resData[key].description,
                            resData[key].imageUrl1,
                            resData[key].imageUrl2,
                            resData[key].slots,
                            new Date(resData[key].day),
                            resData[key].startTime,
                            resData[key].endTime,
                            resData[key].userId,
                            resData[key].participants,
                        )
                        );
                    }
                }
                //return [] 
                return events;
            }),
                tap(events => {
                    this._events.next(events);
                })
            );
    }

    getEvent(id: string) {
        return this.http.get<EventData>(
            `https://mines-foundry.firebaseio.com/offered-events/${id}.json`
        )
            .pipe(
                map(eventData => {
                    return new Event(
                        id,
                        eventData.title,
                        eventData.description,
                        eventData.imageUrl1,
                        eventData.imageUrl2,
                        eventData.slots,
                        new Date(eventData.day),
                        eventData.startTime,
                        eventData.endTime,
                        eventData.userId,
                        eventData.participants
                    );
                })
            );
    }

    addEvent(
        title: string,
        description: string,
        slots: number,
        day: Date,
        startTime: string,
        endTime: string
    ) {
        let generatedId: string;
        let newEvent: Event;
        return this.authService.userId.pipe(take(1), switchMap(userId => {
            if (!userId) {
                throw new Error('No user found!');
            }

            let participants = []


            for (let i=0; i < slots; i++) {
                let empty = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    slot: i+1
                }
                participants.push(empty)
            }

            newEvent = new Event(
                Math.random().toString(),
                title,
                description,
                this.freePourThumbnails[Math.floor(Math.random() * this.freePourThumbnails.length)],
                this.freePourPics[Math.floor(Math.random() * this.freePourPics.length)],
                slots,
                day,
                startTime,
                endTime,
                userId,
                participants
            );

            return this.http.post<{ name: string }>('https://mines-foundry.firebaseio.com/offered-events.json', { ...newEvent, id: null })
        }),
            switchMap(resData => {
                generatedId = resData.name;
                return this.events;
            }),
            take(1),
            tap(events => {
                newEvent.id = generatedId;
                this._events.next(events.concat(newEvent));
            })
        );

        // return this.events.pipe(
        //     take(1),
        //     delay(1000),
        //     tap(events => {
        //         this._events.next(events.concat(newEvent));
        //     })
        // );
    }

    registerForEvent(eventId: string, firstName: string, lastName: string, email: string, slot: number) {
        let updatedEvents: Event[];
        return this.events.pipe(
            take(1),
            switchMap(events => {
                if (!events || events.length <= 0) {
                    return this.fetchEvents();
                } else {
                    return of(events);
                }
            }),
            switchMap(events => {
                const updatedEventIndex = events.findIndex(ev => ev.id === eventId);
                updatedEvents = [...events];
                const oldEvent = updatedEvents[updatedEventIndex]
                const eventSlotIndex = oldEvent.participants.findIndex(pt => pt.slot === slot);
            
                oldEvent.participants[eventSlotIndex].firstName = firstName
                oldEvent.participants[eventSlotIndex].lastName = lastName
                oldEvent.participants[eventSlotIndex].email = email
                oldEvent.participants[eventSlotIndex].avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)]

                const participants = oldEvent.participants.concat()
                updatedEvents[updatedEventIndex] = new Event(
                    oldEvent.id,
                    oldEvent.title,
                    oldEvent.description,
                    oldEvent.imageUrl1,
                    oldEvent.imageUrl2,
                    oldEvent.slots,
                    oldEvent.day,
                    oldEvent.startTime,
                    oldEvent.endTime,
                    oldEvent.userId,
                    oldEvent.participants
                );
                return this.http.put(`https://mines-foundry.firebaseio.com/offered-events/${eventId}.json`,
                    { ...updatedEvents[updatedEventIndex] }
                );
            }),
            tap(() => {
                this._events.next(updatedEvents);
            }
            ));
    }

    updateEvent(eventId: string, title: string, description: string) {
        let updatedEvents: Event[];
        return this.events.pipe(
            take(1),
            switchMap(events => {
                if (!events || events.length <= 0) {
                    return this.fetchEvents();
                } else {
                    return of(events);
                }
            }),
            switchMap(events => {
                const updatedEventIndex = events.findIndex(pl => pl.id === eventId);
                updatedEvents = [...events];
                const oldEvent = updatedEvents[updatedEventIndex]

                updatedEvents[updatedEventIndex] = new Event(
                    oldEvent.id,
                    title,
                    description,
                    oldEvent.imageUrl1,
                    oldEvent.imageUrl2,
                    oldEvent.slots,
                    oldEvent.day,
                    oldEvent.startTime,
                    oldEvent.endTime,
                    oldEvent.userId,
                    oldEvent.participants
                );
                return this.http.put(`https://mines-foundry.firebaseio.com/offered-events/${eventId}.json`,
                    { ...updatedEvents[updatedEventIndex], id: null }
                );
            }),
            tap(() => {
                this._events.next(updatedEvents);
                console.log('Update events tap')
                console.log(updatedEvents)
            }
            ));
    }

    cancelEvent(eventId: string) {
        return this.http.delete(`https://mines-foundry.firebaseio.com/offered-events/${eventId}.json`
        ).pipe(
            switchMap(() => {
                return this.events;
            }),
            take(1),
            tap(events => {
                this._events.next(events.filter(b => b.id !== eventId));
            })
        );
    }

}
