  import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    let response;

    if (req.method === 'PUT') {
      // Update campaign status
      const { is_active } = req.body;
      response = await axios.put(
        `https://panel.adsaro.com/advertiser/api/Campaign/${id}?version=4&token=${token}`,
        {
          is_active: is_active
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } else if (req.method === 'DELETE') {
      // Delete campaign
      response = await axios.delete(
        `https://panel.adsaro.com/advertiser/api/Campaign/${id}?version=4&token=${token}`
      );
    }

    // Return the response from the external API
    if (response) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json({ message: 'No response from external API' });
    }

  } catch (error) {
    console.error('Error in campaign API:', error);
    
    if (axios.isAxiosError(error)) {
      // Forward the error response from the external API
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: 'Network error occurred' });
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
