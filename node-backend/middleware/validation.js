module.exports = {
  ...require('./validation/common'),
  ...require('./validation/authValidation'),
  ...require('./validation/profileValidation'),
  ...require('./validation/activityValidation')
};
