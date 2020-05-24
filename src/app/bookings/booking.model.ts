export class Booking {
    constructor(
        public id: string,
        public eventId: string,
        public userId: string,
        public eventTitle: string,
        public eventImage: string,
        public firstName: string,
        public lastName: string,
        public guestNumber: number,
        public bookedFrom: Date,
        public bookedTo: Date
    ) {}
}