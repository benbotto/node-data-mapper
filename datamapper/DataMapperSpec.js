describe('DataMapper test suite.', function()
{
  'use strict';

  var Schema     = require(__dirname + '/Schema');
  var DataMapper = require(__dirname + '/DataMapper');
  var dm         = new DataMapper();

  // Serializes a single table.
  it('serializes a single table.', function()
  {
    var query =
    [
      {pid: 1, firstName: 'Jack', lastName: 'Black'},
      {pid: 2, firstName: 'Dave', lastName: 'Zander'}
    ];
    var schema = new Schema('pid', 'personID')
      .addProperties('firstName', 'lastName');

    expect(dm.serialize(query, schema)).toEqual
    ([
      {personID: 1, firstName: 'Jack', lastName: 'Black'},
      {personID: 2, firstName: 'Dave', lastName: 'Zander'}
    ]);
  });

  // Serializes two tables.
  it('serializes two tables.', function()
  {
    var query =
    [
      {pid: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1,    phoneNumber: '999-888-7777'},
      {pid: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2,    phoneNumber: '666-555-4444'},
      {pid: 2, firstName: 'Dave', lastName: 'Zander', phoneNumberID: null, phoneNumber: null}
    ];
    var schema = new Schema('pid', 'personID')
      .addProperties('firstName', 'lastName')
      .addSchema('phoneNumbers', new Schema('phoneNumberID')
        .addProperty('phoneNumber'));

    expect(dm.serialize(query, schema)).toEqual
    ([
      {
        personID: 1,
        firstName: 'Jack',
        lastName: 'Black',
        phoneNumbers: 
        [
          {phoneNumberID: 1, phoneNumber: '999-888-7777'},
          {phoneNumberID: 2, phoneNumber: '666-555-4444'}
        ]
      },
      {
        personID: 2,
        firstName: 'Dave',
        lastName: 'Zander',
        phoneNumbers: []
      }
    ]);
  });

  // Serializes a complex query.
  it('serializes a complex query.', function()
  {
    var query =
    [
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-293-4667', prodDesc: 'Nike', productVisible: true, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-200-1440', prodDesc: 'Nike', productVisible: true, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '530-307-8810', prodDesc: 'Nike', productVisible: true, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-293-4667', prodDesc: 'Nike', productVisible: true, catDesc: 'Shoes'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-200-1440', prodDesc: 'Nike', productVisible: true, catDesc: 'Shoes'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '530-307-8810', prodDesc: 'Nike', productVisible: true, catDesc: 'Shoes'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-293-4667', prodDesc: 'Reboc', productVisible: false, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-200-1440', prodDesc: 'Reboc', productVisible: false, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '530-307-8810', prodDesc: 'Reboc', productVisible: false, catDesc: 'Apparel'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-293-4667', prodDesc: 'Reboc', productVisible: false, catDesc: 'Shoes'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '916-200-1440', prodDesc: 'Reboc', productVisible: false, catDesc: 'Shoes'},
      {pid: 1, firstName: 'Joe', lastName: 'Shmo', phoneNumber: '530-307-8810', prodDesc: 'Reboc', productVisible: false, catDesc: 'Shoes'},
      {pid: 3, firstName: 'Rand', lastName: 'AlThore', phoneNumber: '666-451-4412', prodDesc: '', productVisible: '', catDesc: ''},
      {pid: 2, firstName: 'Jack', lastName: 'Davis', phoneNumber: '', prodDesc: 'Crystals', productVisible: true, catDesc: 'Gifts'},
      {pid: 2, firstName: 'Jack', lastName: 'Davis', phoneNumber: '', prodDesc: 'Nike', productVisible: true, catDesc: 'Shoes'}
    ];

    var schema = new Schema('pid', 'personID')
      .addProperties('firstName', 'lastName')
      .addSchema('phoneNumbers', new Schema('phoneNumber'))
      .addSchema('products', new Schema('prodDesc')
        .addProperty('productVisible', 'isVisible')
        .addSchema('categories', new Schema('catDesc')));

    expect(dm.serialize(query, schema)).toEqual
    ([
      {
        personID: 1,
        firstName: 'Joe',
        lastName: 'Shmo',
        phoneNumbers:
        [
          {phoneNumber: '916-293-4667'},
          {phoneNumber: '916-200-1440'},
          {phoneNumber: '530-307-8810'}
        ],
        products:
        [
          {
            prodDesc: 'Nike',
            isVisible: true,
            categories:
            [
              {catDesc: 'Apparel'},
              {catDesc: 'Shoes'}
            ]
          },
          {
            prodDesc: 'Reboc',
            isVisible: false,
            categories:
            [
              {catDesc: 'Apparel'},
              {catDesc: 'Shoes'}
            ]
          },
        ]
      },
      {
        personID: 3,
        firstName: 'Rand',
        lastName: 'AlThore',
        phoneNumbers: [{phoneNumber: '666-451-4412'}],
        products: []
      },
      {
        personID: 2,
        firstName: 'Jack',
        lastName: 'Davis',
        phoneNumbers: [],
        products:
        [
          {
            prodDesc: 'Crystals',
            isVisible: true,
            categories:
            [
              {catDesc: 'Gifts'}
            ]
          },
          {
            prodDesc: 'Nike',
            isVisible: true,
            categories:
            [
              {catDesc: 'Shoes'}
            ]
          },
        ]
      }
    ]);
  });

  // Serializes a query that has a many-to-one relationship.
  it('serializes a query that has a many-to-one relationship.', function()
  {
    var query =
    [
      {personID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1, phoneNumber: '999-888-7777'},
      {personID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2, phoneNumber: '666-555-4444'},
      {personID: 2, firstName: 'Will', lastName: 'Smith',  phoneNumberID: 3, phoneNumber: '333-222-1111'}
    ];
    var schema = new Schema('phoneNumberID')
      .addProperty('phoneNumber')
      .addSchema('person', new Schema('personID')
        .addProperties('firstName', 'lastName'),
      Schema.RELATIONSHIP_TYPE.SINGLE);

    expect(dm.serialize(query, schema)).toEqual
    ([
      {
        phoneNumberID: 1,
        phoneNumber: '999-888-7777',
        person:
        {
          personID: 1,
          firstName: 'Jack',
          lastName: 'Black'
        }
      },
      {
        phoneNumberID: 2,
        phoneNumber: '666-555-4444',
        person:
        {
          personID: 1,
          firstName: 'Jack',
          lastName: 'Black'
        }
      },
      {
        phoneNumberID: 3,
        phoneNumber: '333-222-1111',
        person:
        {
          personID: 2,
          firstName: 'Will',
          lastName: 'Smith'
        }
      }
    ]);
  });

  // Serializes multiple sub-schemata with the same value for primary keys.
  it('serializes multiple sub-schemata with the same value for primary keys.', function()
  {
    // Both phoneNumberID and productID are 1.
    var query =
    [
      {personID: 1, phoneNumberID: 1, productID: 1}
    ];

    var schema = new Schema('personID')
      .addSchema('phoneNumbers', new Schema('phoneNumberID'))
      .addSchema('products',     new Schema('productID'));

    expect(dm.serialize(query, schema)).toEqual
    ([
      {
        personID: 1,
        phoneNumbers: [{phoneNumberID: 1}],
        products: [{productID: 1}]
      }
    ]);
  });
});

