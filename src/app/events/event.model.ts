export class Event {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public imageUrl1: string,
        public imageUrl2: string,
        public slots: number,
        public day: Date,
        public startTime: string,
        public endTime: string,
        public userId: string,
        public participants: any,
        public slotsOpen?: number,
    ) { }
}