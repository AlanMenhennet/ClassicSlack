"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    user = "";
    text = "";
    ts = 0;
    toString() {
        return `${this.getFormattedDate(this.getDate())} | ${this.user}: ${this.text}`;
    }
    getDate() {
        const date = new Date(parseInt(this.ts.toString().split(".")[0]) * 1000);
        return date;
    }
    getFormattedDate(date) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}
exports.Message = Message;
//# sourceMappingURL=Message.js.map