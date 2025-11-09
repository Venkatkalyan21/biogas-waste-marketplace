// Geocoding utility using Mapbox Geocoding API (free tier available)
const axios = require('axios');

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

/**
 * Geocode an address to coordinates (forward geocoding)
 * @param {string} address - Full address string
 * @returns {Promise<{latitude: number, longitude: number, address: object}>}
 */
async function geocodeAddress(address) {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('MAPBOX_ACCESS_TOKEN not set, geocoding disabled');
    return null;
  }

  try {
    const response = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + 
      encodeURIComponent(address) + '.json', {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        limit: 1
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      const [longitude, latitude] = feature.center;
      const context = feature.context || [];
      
      // Extract address components
      const addressParts = {
        street: feature.text || '',
        city: context.find(c => c.id.startsWith('place'))?.text || '',
        state: context.find(c => c.id.startsWith('region'))?.text || '',
        country: context.find(c => c.id.startsWith('country'))?.text || '',
        zipCode: context.find(c => c.id.startsWith('postcode'))?.text || ''
      };

      return {
        latitude,
        longitude,
        address: addressParts
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address (reverse geocoding)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
async function reverseGeocode(latitude, longitude) {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('MAPBOX_ACCESS_TOKEN not set, reverse geocoding disabled');
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          limit: 1
        }
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      const context = feature.context || [];
      
      return {
        street: feature.text || '',
        city: context.find(c => c.id.startsWith('place'))?.text || '',
        state: context.find(c => c.id.startsWith('region'))?.text || '',
        country: context.find(c => c.id.startsWith('country'))?.text || '',
        zipCode: context.find(c => c.id.startsWith('postcode'))?.text || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
}

module.exports = { geocodeAddress, reverseGeocode };

