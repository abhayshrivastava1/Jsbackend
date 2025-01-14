class ApiResponse {
  constructor(data, message = "true", statusCode)
   {
    this.message = message
    this.data = data
    this.statusCode = statusCode
    this.success = statusCode < 400
   }
}