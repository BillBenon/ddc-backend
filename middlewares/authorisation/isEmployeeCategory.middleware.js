exports.isEmployeeCategory = (categories) => {
  // return function (req, res, next) {
  //    if(req.AUTH_DATA.EMPLOYEE_TYPE !== category) return res.send({message: 'You are not Authorized'}).status(401);
  //   next();
  // }
    return function (req, res, next) {
      if (!(categories.find((category) => category === req.AUTH_DATA.EMPLOYEE_TYPE)))
          return res.send({message: 'You are not Authorized'}).status(401);
     next();
  }
}
