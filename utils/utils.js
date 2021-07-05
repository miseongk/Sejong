const setDateTZ = (date) => {
  return new Date(new Date(date).getTime() + 540 * 60 * 1000);
};

module.exports = {
  setDateTZ,
};
