describe('DataMapper()', function() {
  'use strict';

  const insulin    = require('insulin');
  const Schema     = insulin.get('ndm_Schema');
  const DataMapper = insulin.get('ndm_DataMapper');
  const dm         = new DataMapper();

  /**
   * Serialize.
   */
  describe('.serialize()', function() {
    it('serializes a single table.', function() {
      const query = [
        {pid: 1, firstName: 'Jack', lastName: 'Black'},
        {pid: 2, firstName: 'Dave', lastName: 'Zander'}
      ];
      const schema = new Schema('pid', 'personID')
        .addProperties('firstName', 'lastName');

      expect(dm.serialize(query, schema)).toEqual([
        {personID: 1, firstName: 'Jack', lastName: 'Black'},
        {personID: 2, firstName: 'Dave', lastName: 'Zander'}
      ]);
    });

    it('serializes multiple tables.', function() {
      const query = [
        {pid: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1,    phoneNumber: '999-888-7777'},
        {pid: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2,    phoneNumber: '666-555-4444'},
        {pid: 2, firstName: 'Dave', lastName: 'Zander', phoneNumberID: null, phoneNumber: null}
      ];
      const schema = new Schema('pid', 'personID')
        .addProperties('firstName', 'lastName')
        .addSchema('phoneNumbers', new Schema('phoneNumberID')
          .addProperty('phoneNumber'));

      expect(dm.serialize(query, schema)).toEqual([
        {
          personID: 1,
          firstName: 'Jack',
          lastName: 'Black',
          phoneNumbers:  [
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

    it('serializes complex queries recursively.', function() {
      const query = [
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

      const schema = new Schema('pid', 'personID')
        .addProperties('firstName', 'lastName')
        .addSchema('phoneNumbers', new Schema('phoneNumber'))
        .addSchema('products', new Schema('prodDesc')
          .addProperty('productVisible', 'isVisible')
          .addSchema('categories', new Schema('catDesc')));

      expect(dm.serialize(query, schema)).toEqual([
        {
          personID: 1,
          firstName: 'Joe',
          lastName: 'Shmo',
          phoneNumbers: [
            {phoneNumber: '916-293-4667'},
            {phoneNumber: '916-200-1440'},
            {phoneNumber: '530-307-8810'}
          ],
          products: [
            {
              prodDesc: 'Nike',
              isVisible: true,
              categories: [
                {catDesc: 'Apparel'},
                {catDesc: 'Shoes'}
              ]
            },
            {
              prodDesc: 'Reboc',
              isVisible: false,
              categories: [
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
          products: [
            {
              prodDesc: 'Crystals',
              isVisible: true,
              categories: [
                {catDesc: 'Gifts'}
              ]
            },
            {
              prodDesc: 'Nike',
              isVisible: true,
              categories: [
                {catDesc: 'Shoes'}
              ]
            },
          ]
        }
      ]);
    });

    it('serializes many-to-one relationships.', function() {
      const query = [
        {personID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1, phoneNumber: '999-888-7777'},
        {personID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2, phoneNumber: '666-555-4444'},
        {personID: 2, firstName: 'Will', lastName: 'Smith',  phoneNumberID: 3, phoneNumber: '333-222-1111'}
      ];
      const schema = new Schema('phoneNumberID')
        .addProperty('phoneNumber')
        .addSchema('person', new Schema('personID')
          .addProperties('firstName', 'lastName'),
        Schema.RELATIONSHIP_TYPE.SINGLE);

      expect(dm.serialize(query, schema)).toEqual([
        {
          phoneNumberID: 1,
          phoneNumber: '999-888-7777',
          person: {
            personID: 1,
            firstName: 'Jack',
            lastName: 'Black'
          }
        },
        {
          phoneNumberID: 2,
          phoneNumber: '666-555-4444',
          person: {
            personID: 1,
            firstName: 'Jack',
            lastName: 'Black'
          }
        },
        {
          phoneNumberID: 3,
          phoneNumber: '333-222-1111',
          person: {
            personID: 2,
            firstName: 'Will',
            lastName: 'Smith'
          }
        }
      ]);
    });

    it('serializes multiple sub-schemata with the same primary key value.', function() {
      // Both phoneNumberID and productID are 1.
      const query = [
        {personID: 1, phoneNumberID: 1, productID: 1}
      ];

      const schema = new Schema('personID')
        .addSchema('phoneNumbers', new Schema('phoneNumberID'))
        .addSchema('products',     new Schema('productID'));

      expect(dm.serialize(query, schema)).toEqual([
        {
          personID: 1,
          phoneNumbers: [{phoneNumberID: 1}],
          products: [{productID: 1}]
        }
      ]);
    });

    it('uses converters when serializing.', function() {
      function idConvert(id) {
        return id + 10;
      }

      function ucConvert(str) {
        return str.toUpperCase();
      }

      const query = [
        {pid: 1, firstName: 'Jack', lastName: 'Black'},
        {pid: 2, firstName: 'Dave', lastName: 'Zander'}
      ];
      const schema = new Schema('pid', 'personID', idConvert)
        .addProperty('firstName', 'first', ucConvert)
        .addProperty('lastName');

      expect(dm.serialize(query, schema)).toEqual([
        {personID: 11, first: 'JACK', lastName: 'Black'},
        {personID: 12, first: 'DAVE', lastName: 'Zander'}
      ]);
    });
  });
});

