import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.API_KEY
});

const baseAirtable = Airtable.base(process.env.BASE_ID);

export default baseAirtable;
