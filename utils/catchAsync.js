/** Executes the middleware and catches any async errors that may not be handled */
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
