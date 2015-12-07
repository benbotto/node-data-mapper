var db =
{
  name: 'bike_shop',
  tables:
  [
    {
      name: 'bike_shops',
      alias: 'bikeShops',
      columns:
      [
        {name: 'bikeShopID', isPrimary: true},
        {name: 'name'},
        {name: 'address'}
      ]
    },
    {
      name: 'staff',
      columns:
      [
        {name: 'staffID', isPrimary: true},
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'hasStoreKeys'},
        {name: 'hireDate'},
        {name: 'bikeShopID'}
      ]
    },
    {
      name: 'bonuses',
      columns:
      [
        {name: 'bonusID', isPrimary: true},
        {name: 'reason'},
        {name: 'amount'},
        {name: 'dateGiven'},
        {name: 'staffID'}
      ]
    },
    {
      name: 'bikes',
      columns:
      [
        {name: 'bikeID', isPrimary: true},
        {name: 'brand'},
        {name: 'model'},
        {name: 'msrp'}
      ]
    },
    {
      name: 'bikeShopBikes',
      columns:
      [
        {name: 'bikeShopBikeID', isPrimary: true},
        {name: 'bikeShopID'},
        {name: 'bikeID'}
      ]
    }
  ]
};

module.exports = db;

