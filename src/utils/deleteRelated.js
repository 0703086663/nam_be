import { Field } from '../model/field.model.js';
import { Survey } from '../model/survey.model.js';
import { Response } from '../model/response.model.js';
import baseAirtable from './baseAirtable.js';

const deleteRelated = async (_id) => {
  try {
    await new Promise((resolve, reject) => {
      baseAirtable('surveys').destroy(_id, async (err) => {
        if (err) {
          console.error('Error deleting survey from Airtable:', err);
          return reject(err);
        }
        try {
          await Survey.deleteOne({ _id });
          resolve();
        } catch (err) {
          console.error('Error deleting survey from MongoDB:', err);
          reject(err);
        }
      });
    });

    await new Promise((resolve, reject) => {
      baseAirtable('responses')
        .select({
          filterByFormula: `{survey_id} = "${_id}"`
        })
        .eachPage((records) => {
          const responseIds = records.map((record) => record.id);

          if (responseIds.length > 0) {
            baseAirtable('responses').destroy(responseIds, async (err) => {
              if (err) {
                console.error('Error deleting responses from Airtable:', err);
                return reject(err);
              }
              try {
                await Response.deleteMany({ survey_id: _id });
                resolve();
              } catch (err) {
                console.error('Error deleting responses from MongoDB:', err);
                reject(err);
              }
            });
          } else {
            resolve();
          }
        });
    });

    await new Promise((resolve, reject) => {
      baseAirtable('fields')
        .select({
          filterByFormula: `{survey_id} = "${_id}"`
        })
        .eachPage((records) => {
          const fieldIds = records.map((record) => record.id);

          if (fieldIds.length > 0) {
            baseAirtable('fields').destroy(fieldIds, async (err) => {
              if (err) {
                console.error('Error deleting fields from Airtable:', err);
                return reject(err);
              }
              try {
                await Field.deleteMany({ survey_id: _id });
                resolve();
              } catch (err) {
                console.error('Error deleting fields from MongoDB:', err);
                reject(err);
              }
            });
          } else {
            resolve();
          }
        });
    });

    return { success: true, message: 'Deleted successfully' };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Internal server error');
  }
};

export default deleteRelated;
