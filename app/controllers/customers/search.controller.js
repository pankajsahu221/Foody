const Menu = require("../../models/menu.model.js");

exports.getSearchData = async (req, res) => {
  try {
    const inpval = req.params.inpval;
    const foods = await Menu.find().lean();

    let filteredFoods = foods.filter(item => {
      // return those item which contains the keyword that we got from the input
      return item.name.toLowerCase().includes(inpval.toLowerCase());
    });
    res.status(200).json(filteredFoods);
  } catch (e) {
    console.log(e);
  }
};
