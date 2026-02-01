//ye async handler middleware hai jo async functions ko handle karta hai
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=>next(err));
    }
}


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async() => {}

//ye try catch wala version hai
// const asyncHandler = (fn) =>async(req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// }