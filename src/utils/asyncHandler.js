// A utility function to handle asynchronous request handlers in Express.js
// It takes a request handler function as an argument and returns a new function that wraps the original function in a Promise.
// This allows us to catch any errors that occur in the asynchronous code and pass them to the next middleware (error handling middleware) without having to use try-catch blocks in every request handler.
// Example usage:
// const someAsyncHandler = asyncHandler(async (req, res) => {
//     // some asynchronous code that might throw an error
//     const data = await someAsyncFunction();
//     res.json(data);
// });
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};


export { asyncHandler };