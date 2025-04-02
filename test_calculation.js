// Test script for vehicle tax calculator
const { calculateAllTaxes } = require('./src/lib/calculation_model.js');

// Example data from the conversation:
// - Electric vehicle with personal import M1
// - Manufacturing date: 01/01/2025
// - Invoice amount: 50,000 USD
// - Exchange rate: 4
// - Shipping cost: 2,000 USD
// - Local expenses: 3,500 ILS
// - No origin declaration
// - Weight less than 3500 kg and less than 4500 kg
// Expected results:
// - Consumer price: 525,821 ILS
// - Luxury tax rate: 8.59%

const testData = {
  vehicleType: 'electric_personal',
  manufacturingDate: '2025-01-01',
  invoiceAmount: '50000',
  exchangeRate: '4',
  shippingCost: '2000',
  localExpenses: '3500',
  hasOriginDeclaration: 'לא',
  weightAbove3500: 'לא',
  weightAbove4500: 'לא',
  priceAbove300k: 'כן',
  consumerPrice: ''
};

const result = calculateAllTaxes(testData);

console.log('Test Results:');
console.log('=============');
console.log('Customs Value:', result.customsValue, 'ILS');
console.log('Customs Duty:', result.customsDuty, 'ILS');
console.log('Purchase Tax Value:', result.purchaseTaxValue, 'ILS');
console.log('Purchase Tax:', result.purchaseTax, 'ILS');
console.log('Luxury Tax Rate:', result.luxuryTaxRate);
console.log('VAT:', result.vat, 'ILS');
console.log('Total Taxes:', result.totalTaxes, 'ILS');
console.log('Total Cost:', result.totalCost, 'ILS');
console.log('Estimated Consumer Price:', result.estimatedConsumerPrice, 'ILS');

// Verify expected results
const expectedConsumerPrice = 525821;
const expectedLuxuryTaxRate = '8.59%';

console.log('\nVerification:');
console.log('=============');
console.log('Expected Consumer Price:', expectedConsumerPrice.toFixed(2), 'ILS');
console.log('Actual Consumer Price:', result.estimatedConsumerPrice);
console.log('Expected Luxury Tax Rate:', expectedLuxuryTaxRate);
console.log('Actual Luxury Tax Rate:', result.luxuryTaxRate);

if (parseFloat(result.estimatedConsumerPrice) === expectedConsumerPrice && 
    result.luxuryTaxRate === expectedLuxuryTaxRate) {
  console.log('\nTEST PASSED: The calculation model is working correctly!');
} else {
  console.log('\nTEST FAILED: The calculation model needs further adjustments.');
  
  if (parseFloat(result.estimatedConsumerPrice) !== expectedConsumerPrice) {
    console.log(`Consumer Price Discrepancy: Expected ${expectedConsumerPrice.toFixed(2)}, Got ${result.estimatedConsumerPrice}`);
  }
  
  if (result.luxuryTaxRate !== expectedLuxuryTaxRate) {
    console.log(`Luxury Tax Rate Discrepancy: Expected ${expectedLuxuryTaxRate}, Got ${result.luxuryTaxRate}`);
  }
}
