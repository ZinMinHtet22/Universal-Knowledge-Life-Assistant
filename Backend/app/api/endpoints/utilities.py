from fastapi import APIRouter, Depends, HTTPException, Query
from app.api import dependencies
from app.db import models
from app.services.currency import convert_currency

router = APIRouter()

@router.get("/currency")
async def get_currency_conversion(
    amount: float,
    from_currency: str,
    to_currency: str,
    current_user: models.User = Depends(dependencies.get_current_user)
):
    try:
        result = await convert_currency(amount, from_currency, to_currency)
        return {"amount": amount, "from": from_currency, "to": to_currency, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Standard Unit Conversions
CONVERSIONS = {
    "Weight": {
        "Kilograms": 1,
        "Grams": 1000,
        "Pounds": 2.20462,
        "Ounces": 35.274
    },
    "Length": {
        "Meters": 1,
        "Centimeters": 100,
        "Kilometers": 0.001,
        "Miles": 0.000621371,
        "Feet": 3.28084,
        "Inches": 39.3701
    },
    "Volume": {
        "Liters": 1,
        "Milliliters": 1000,
        "Gallons": 0.264172,
        "Fluid Ounces": 33.814
    }
}

@router.get("/unit")
def get_unit_conversion(
    amount: float,
    category: str,
    from_unit: str,
    to_unit: str,
    current_user: models.User = Depends(dependencies.get_current_user)
):
    try:
        # Temperature is non-linear, handle separately
        if category == "Temperature":
            return {"result": convert_temperature(amount, from_unit, to_unit)}

        if category not in CONVERSIONS:
            raise ValueError("Unsupported category")
        
        rates = CONVERSIONS[category]
        if from_unit not in rates or to_unit not in rates:
            raise ValueError("Unsupported unit")
            
        # Convert to base unit then to target unit
        base_amount = amount / rates[from_unit]
        target_amount = base_amount * rates[to_unit]
        
        return {"result": round(target_amount, 4)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def convert_temperature(amount: float, from_unit: str, to_unit: str) -> float:
    if from_unit == to_unit:
        return amount
        
    # Convert to Celsius first
    if from_unit == "Celsius":
        celsius = amount
    elif from_unit == "Fahrenheit":
        celsius = (amount - 32) * 5/9
    elif from_unit == "Kelvin":
        celsius = amount - 273.15
    else:
        raise ValueError("Unsupported temperature unit")
        
    # Convert from Celsius to target
    if to_unit == "Celsius":
        result = celsius
    elif to_unit == "Fahrenheit":
        result = (celsius * 9/5) + 32
    elif to_unit == "Kelvin":
        result = celsius + 273.15
    else:
        raise ValueError("Unsupported temperature unit")
        
    return round(result, 2)
