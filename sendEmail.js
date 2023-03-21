require('dotenv').config();
const express = require('express');
const sendEmailRoute = express.Router();
const cron = require('node-cron');

sendEmailRoute.get('/', (req, res) => {
    // cron job to send email at 4:45 pm every day
    cron.schedule('45 16 * * *', () => {
        console.log('running a task every minutess');
        res.send('Hello World!');
    }, {});
    // test cron 

});

cron.schedule('45 16 * * * *', () => {
    try {
        console.log('running a task every minuteee');
        var Airtable = require('airtable');
        var base = new Airtable({ apiKey: process.env.AIRTABLE_APIKEY }).base(process.env.AIRTABLE_BASE);

        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }); // get today's date in 'DD/MM/YY' format
        
        console.log(today);
        const recordsToSend = []; // create an empty array to store the records that match the filter formula

        base('visit days').select({
            // Selecting the day's records in Grid view:
            maxRecords: 1,
            filterByFormula: `DATETIME_DIFF(DATETIME_PARSE(Date, 'DD/MM/YYYY'), NOW(), 'days') = 0`,
            view: "report1",
        }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            records.forEach(function (record) {
                recordsToSend.push({
                    Date: record.get('Date'),
                    consultationsId: record.get('consultationsId'),
                    clientName: record.get('clientsName'),
                    Doctor: record.get('doctorName'),
                    Notes: record.get('Notes'),
                    completed: record.get('completed'),
                });
            });

            console.log(recordsToSend);

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage();
        });


        const sgmail = require('@sendgrid/mail')
        

        sgmail.setApiKey(process.env.SENDGRID_APIKEY)
       
        const message = {
            to: 'victor.ndegwa@malaica.com',
            from: {
                name: 'Hospital',
                email: 'keruboannamaria@gmail.com',
            },
            subject: 'Today\'s Summary report on visits at the hospital',
            // text: 'This is a summary report of the visits at the hospital today',
            // text: `Date: ${record.get('Date')}\nConsultations ID: ${record.get('consultationsId')}\nClient Name: ${record.get('clientName')}\nDoctor: ${record.get('Doctor')}\nNotes: ${record.get('Notes')}\nCompleted: ${record.get('completed')}`,
            html: `
            <h1>Summary report on visits for today at the hospital</h1>
            <ul>
                ${recordsToSend.map((record) => `
                    <li>
                        <p><strong>Date:</strong> ${record.Date}</p>
                        <p><strong>Consultations ID:</strong> ${record.consultationsId}</p>
                        <p><strong>Client Name:</strong> ${record.clientName}</p>
                        <p><strong>Doctor:</strong> ${record.Doctor}</p>
                        <p><strong>Notes:</strong> ${record.Notes}</p>
                        <p><strong>Completed:</strong> ${record.completed}</p>
                    </li>
                `
            ).join('')}
            </ul>
            `,

        }
        sgmail
            .send(message)
            .then((response) => console.log('Email sent...'))
            .catch((error) => console.log(error.message))
    } catch (error) {
        console.log(error.message);
    }
});
module.exports = sendEmailRoute;
