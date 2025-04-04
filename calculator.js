// הגדרת משתנים גלובליים לחישובים
let customsValue = 0;
let customsDuty = 0;
let purchaseTax = 0;
let purchaseTaxRate = 0;
let vat = 0;
let totalTaxes = 0;
let totalTaxRate = 0;
let totalValue = 0;
let finalPrice = 0;
let luxuryTaxData = null;
let lastCalculatedPrice = 0;
let isCalculating = false;
let isPriceCalculated = false;
let luxuryTax = 0;
let luxuryTaxRate = 0;

// בדיקת תקופת הייצור
function checkManufacturingDate() {
    const manufacturingDate = new Date(document.getElementById('manufacturing-date').value);
    const currentDate = new Date();
    const monthsDifference = (currentDate.getFullYear() - manufacturingDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - manufacturingDate.getMonth());
    
    const errorElement = document.getElementById('manufacturing-date-error');
    const submitButton = document.getElementById('submit-button');
    
    if (monthsDifference > 24) {
        errorElement.style.display = 'block';
        submitButton.disabled = true;
        return false;
    } else {
        errorElement.style.display = 'none';
        submitButton.disabled = false;
        return true;
    }
}

// חישוב המחיר
function calculatePrice() {
    if (!checkManufacturingDate() || isCalculating) {
        return;
    }

    isCalculating = true;

    const invoiceAmount = parseFloat(document.getElementById('invoice-amount').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shipping-cost').value) || 0;
    const localExpenses = parseFloat(document.getElementById('local-expenses').value) || 0;
    const manufacturingDate = new Date(document.getElementById('manufacturing-date').value);
    const currentDate = new Date();
    const hasOriginDeclaration = document.querySelector('input[name="origin"]:checked')?.value === 'yes';
    const israelPrice = parseFloat(document.getElementById('israel-price').value) || 0;

    // חישוב ערך לצרכי מכס
    customsValue = (invoiceAmount * exchangeRate) + (shippingCost * exchangeRate) + localExpenses;

    // חישוב מכס (7% אם אין הצהרת מקור)
    customsDuty = hasOriginDeclaration ? 0 : customsValue * 0.07;

    // ערך לצרכי מס קנייה
    const purchaseTaxBase = customsValue + customsDuty;

    // חישוב מס קנייה בשתי אפשרויות
    const purchaseTaxOption1 = (purchaseTaxBase * 0.83) - 35000 - 19048;
    const purchaseTaxOption2 = purchaseTaxBase * 0.45;
    
    // חישוב מס יוקרה
    luxuryTax = 0;
    luxuryTaxRate = 0;
    if (israelPrice > 300000) {
        const excessAmount = israelPrice - 300000;
        luxuryTaxRate = (excessAmount / israelPrice) * 0.2 * 100;
        luxuryTax = (excessAmount / israelPrice) * 0.2 * purchaseTaxBase;
    }
    
    // בחירת הערך הגבוה מבין שתי האפשרויות והוספת מס יוקרה
    purchaseTax = Math.max(purchaseTaxOption1, purchaseTaxOption2) + luxuryTax;
    
    // חישוב שיעור מס קנייה נומינלי
    purchaseTaxRate = (purchaseTax / purchaseTaxBase) * 100;

    // ערך לצרכי מע"מ
    const vatBase = customsValue + customsDuty + purchaseTax;

    // חישוב מע"מ (18%)
    vat = vatBase * 0.18;

    // חישוב סך המיסים ושיעורם
    totalTaxes = customsDuty + (purchaseTax - luxuryTax) + vat;
    totalTaxRate = ((customsDuty + (purchaseTax - luxuryTax) + vat) / customsValue) * 100;

    // ערך הרכב כולל מיסים
    totalValue = customsValue + totalTaxes;

    // חישוב חודשים מתאריך הייצור
    const monthsDifference = (currentDate.getFullYear() - manufacturingDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - manufacturingDate.getMonth());
    
    // חישוב מקדם הזמן (1.0125^x)
    const timeFactor = Math.pow(1.0125, monthsDifference);

    // חישוב מחיר צרכן סופי
    finalPrice = totalValue * (1 + 0.2375 * timeFactor);
    lastCalculatedPrice = finalPrice;
    document.getElementById('result-value').textContent = `₪${finalPrice.toLocaleString()}`;

    // העברת נתוני מס יוקרה לדף התוצאות
    luxuryTaxData = {
        rate: luxuryTaxRate,
        amount: luxuryTax
    };

    isCalculating = false;
    isPriceCalculated = true;
}

// פונקציה לשמירת כל הנתונים ב-sessionStorage
function saveFormData() {
    const formData = {
        'invoice-amount': document.getElementById('invoice-amount').value,
        'currency-type': document.getElementById('currency-type').value,
        'exchange-rate': document.getElementById('exchange-rate').value,
        'shipping-cost': document.getElementById('shipping-cost').value,
        'local-expenses': document.getElementById('local-expenses').value,
        'manufacturing-date': document.getElementById('manufacturing-date').value,
        'origin': document.querySelector('input[name="origin"]:checked')?.value,
        'israel-price': document.getElementById('israel-price').value,
        'weight': document.querySelector('input[name="weight"]:checked')?.value,
        'weight-4500': document.querySelector('input[name="weight-4500"]:checked')?.value,
        'final-price': lastCalculatedPrice,
        'is-price-calculated': isPriceCalculated
    };
    sessionStorage.setItem('calculatorFormData', JSON.stringify(formData));
}

// פונקציה לטעינת הנתונים מ-sessionStorage
function loadFormData() {
    const isPageRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD;
    
    if (isPageRefresh) {
        sessionStorage.removeItem('calculatorFormData');
        return;
    }

    const savedData = sessionStorage.getItem('calculatorFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.entries(formData).forEach(([id, value]) => {
            if (value) {
                if (id === 'origin' || id === 'weight' || id === 'weight-4500') {
                    const radio = document.querySelector(`input[name="${id}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else if (id === 'final-price') {
                    document.getElementById('result-value').textContent = `₪${value.toLocaleString()}`;
                    lastCalculatedPrice = value;
                } else if (id === 'is-price-calculated') {
                    isPriceCalculated = value;
                } else {
                    const element = document.getElementById(id);
                    if (element) element.value = value;
                }
            }
        });
    }
}

// אתחול האירועים
function initializeEvents() {
    // הוספת מאזיני אירועים לשדות הקלט
    document.querySelectorAll('input, select').forEach(input => {
        if (input.id !== 'israel-price') {
            input.addEventListener('input', () => {
                saveFormData();
                calculatePrice();
            });

            if (input.type === 'radio') {
                input.addEventListener('change', () => {
                    saveFormData();
                    calculatePrice();
                });
            }
        }
    });

    // מאזין אירועים נפרד לשדה המחיר לצרכן
    document.getElementById('israel-price').addEventListener('input', function() {
        saveFormData();
    });

    // טיפול בשליחת הטופס
    document.getElementById('calculator-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (checkManufacturingDate()) {
            calculatePrice();
            
            const params = new URLSearchParams({
                customsValue: customsValue,
                customsDuty: customsDuty,
                purchaseTax: purchaseTax - luxuryTax,
                purchaseTaxRate: purchaseTaxRate,
                vat: vat,
                totalTaxes: customsDuty + (purchaseTax - luxuryTax) + vat,
                totalTaxRate: ((customsDuty + (purchaseTax - luxuryTax) + vat) / customsValue) * 100,
                totalValue: totalValue,
                luxuryTaxRate: luxuryTaxRate,
                luxuryTaxAmount: luxuryTax
            });
            
            window.location.href = `results.html?${params.toString()}`;
        }
    });
}

// טעינת הנתונים בעת טעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    initializeEvents();
}); 