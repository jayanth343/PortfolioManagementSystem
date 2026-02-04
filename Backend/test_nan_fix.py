"""
Test script to verify NaN values are properly sanitized for JSON serialization
"""

import math
import json
from services.stock_service import sanitize_value

def test_sanitize_value():
    """Test the sanitize_value function with various inputs"""
    
    # Test NaN
    assert sanitize_value(float('nan')) is None, "NaN should be converted to None"
    
    # Test positive infinity
    assert sanitize_value(float('inf')) is None, "Positive infinity should be converted to None"
    
    # Test negative infinity
    assert sanitize_value(float('-inf')) is None, "Negative infinity should be converted to None"
    
    # Test None
    assert sanitize_value(None) is None, "None should remain None"
    
    # Test normal numbers
    assert sanitize_value(42) == 42, "Normal integers should pass through"
    assert sanitize_value(3.14) == 3.14, "Normal floats should pass through"
    assert sanitize_value(0) == 0, "Zero should pass through"
    assert sanitize_value(-5.5) == -5.5, "Negative numbers should pass through"
    
    # Test strings and other types
    assert sanitize_value("test") == "test", "Strings should pass through"
    assert sanitize_value([1, 2, 3]) == [1, 2, 3], "Lists should pass through"
    
    print("✓ All sanitize_value tests passed!")

def test_json_serialization():
    """Test that sanitized values can be serialized to JSON"""
    
    # Create test data with NaN values
    test_data = {
        'normalValue': 42,
        'nanValue': sanitize_value(float('nan')),
        'infValue': sanitize_value(float('inf')),
        'negInfValue': sanitize_value(float('-inf')),
        'nullValue': sanitize_value(None),
        'stringValue': 'test',
        'nestedObject': {
            'price': 100.5,
            'invalid': sanitize_value(float('nan'))
        }
    }
    
    # Try to serialize to JSON
    try:
        json_string = json.dumps(test_data)
        print(f"✓ JSON serialization successful: {json_string}")
        
        # Parse it back
        parsed = json.loads(json_string)
        assert parsed['normalValue'] == 42
        assert parsed['nanValue'] is None
        assert parsed['infValue'] is None
        assert parsed['negInfValue'] is None
        print("✓ JSON deserialization successful!")
        
    except (TypeError, ValueError) as e:
        print(f"✗ JSON serialization failed: {e}")
        raise

if __name__ == '__main__':
    print("Testing NaN sanitization fix...")
    print("=" * 50)
    
    test_sanitize_value()
    test_json_serialization()
    
    print("=" * 50)
    print("✓ All tests passed! NaN values are properly handled.")
