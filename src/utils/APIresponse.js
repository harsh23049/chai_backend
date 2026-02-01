//ye API response structure define karta hai
//in sab ko ek sath bhejne ke liye
//iske through hum consistent response structure bana sakte hain
// information response(100-199), success(200-299), redirection(300-399), client error(400-499), server error(500-599)

class APIResponse {
    constructor(statusCode, message, data, errors = []) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.success = statusCode < 400; // Assuming success if status code is less than 400
    }
}