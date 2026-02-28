export declare class Message {
    user: string;
    text: string;
    ts: number;
    toString(): string;
    getDate(): Date;
    getFormattedDate(date: Date): string;
}
