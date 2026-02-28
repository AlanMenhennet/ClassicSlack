export class SlackerMessage {
    user: string = "";
    text: string = "";
    ts: number = 0;

    toString(): string {
        return `${this.getFormattedDate(this.getDate())} | ${this.user}: ${this.text}`;
    }

    getDate(): Date {
        const date = new Date(
            parseInt(this.ts.toString().split(".")[0]) * 1000,
        );
        return date;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}
