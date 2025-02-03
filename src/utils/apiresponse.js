// class ApiResponse {
//   constructor(data, message = "true", statusCode)
//    {
//     this.message = message
//     this.data = data
//     this.statusCode = statusCode
//     this.success = statusCode < 400
//    }
// }

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // Ensure status code comes first
    this.success = statusCode < 400; // Set success based on status code
    this.message = message; // Message should be a string, not "true"
    this.data = data; // Data should contain user details
  }
}



export { ApiResponse };