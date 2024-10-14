function parseAndFilterDictArray(input_array, desired_value_key_path, filter_keys){
  let result = input_array.map(x => parseJSON(x, desired_value_key_path, filter_keys)).filter(val => val !== null);
  return result;
}

function parseJSON(jsonObject, desired_value_key_path, filter) {
    // Function to recursively search through the object
    function searchObject(obj, keys) {
      if (keys.length === 0) {
        return obj;
      }

      const key = keys[0];
      if (!(key in obj)) {
        return null;
      }

      const value = obj[key];
      
      if (Array.isArray(value) && typeof keys[1] === 'number') {
        // If current value is an array and next key is a number, get the element at that index
        return searchObject(value[keys[1]], keys.slice(2));
      }

      return searchObject(value, keys.slice(1));
    }

    // Check that the dictionary has the desired value in the wanted key path
    let value_in_filter_keys = searchObject(jsonObject, filter.keys);
    if (value_in_filter_keys != filter.value) {
      return null;
    }

    // Search for the desired value
    const result = searchObject(jsonObject, desired_value_key_path);

    return result;
}

export {
    parseJSON,
    parseAndFilterDictArray
}
