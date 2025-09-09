export const provinces = ['Central','Eastern','North Central','Northern','North Western','Sabaragamuwa','Southern','Uva','Western'];

export const districtsByProvince = {
  Northern: ['Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu'],
  Eastern: ['Trincomalee','Batticaloa','Ampara'],
  'North Central': ['Anuradhapura','Polonnaruwa'],
  'North Western': ['Kurunegala','Puttalam'],
  Central: ['Kandy','Matale','Nuwara Eliya'],
  Sabaragamuwa: ['Ratnapura','Kegalle'],
  Southern: ['Galle','Matara','Hambantota'],
  Uva: ['Badulla','Monaragala'],
  Western: ['Colombo','Gampaha','Kalutara']
};

// UGC + recognized list (can be extended later)
export const universities = [
  'University of Colombo','University of Peradeniya','University of Moratuwa','University of Kelaniya',
  'University of Sri Jayewardenepura','University of Jaffna','University of Ruhuna','Eastern University, Sri Lanka',
  'South Eastern University of Sri Lanka','Sabaragamuwa University of Sri Lanka','Rajarata University of Sri Lanka',
  'Wayamba University of Sri Lanka','Uva Wellassa University','University of the Visual and Performing Arts',
  'Open University of Sri Lanka','University of Vavuniya','Gampaha Wickramarachchi University',
  'General Sir John Kotelawala Defence University','University of Vocational Technology'
];

// Example: Northern → Jaffna (replace with parsed full lists from attachments)
export const schoolsByProvinceDistrict = {
  Northern: {
    Jaffna: [
      'Jaffna Central College','Vembadi Girls’ High School','Jaffna Hindu College','Chavakachcheri Hindu College',
      'St. John’s College','St. Patrick’s College','Holy Family Convent','Hartley College'
    ]
  }
};
