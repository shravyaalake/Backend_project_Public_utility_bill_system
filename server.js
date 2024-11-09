const express = require('express');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const app = express();

app.use(express.json());

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//Integrating queues
const { Queue, PriorityQueue } = require('./queue');

const paymentQueue = new Queue();
const priorityQueue = new PriorityQueue();

app.post('/addPayment', (req, res) => {
    const { type, amount, urgent } = req.body;
    const payment = { type, amount, date: new Date().toISOString() };

    if (urgent) {
        priorityQueue.enqueue(payment, true);
        res.send('Urgent payment request added to the priority queue');
    } else {
        paymentQueue.enqueue(payment);
        res.send('Payment request added to the normal queue');
    }
});

app.get('/processPayment', (req, res) => {
    if (!priorityQueue.isEmpty()) {
        const processedPayment = priorityQueue.dequeue();
        res.send(`Processed urgent payment: ${JSON.stringify(processedPayment)}`);
    } else if (!paymentQueue.isEmpty()) {
        const processedPayment = paymentQueue.dequeue();
        res.send(`Processed normal payment: ${JSON.stringify(processedPayment)}`);
    } else {
        res.send('No payments to process');
    }
});

//Tracking transaction histroy
const Stack = require('./transactionStack');
const transactionStack = new Stack();

app.post('/completeTransaction', (req, res) => {
    const { type, amount } = req.body;
    const transaction = { type, amount, date: new Date().toISOString() };

    transactionStack.push(transaction);
    res.send('Transaction completed and added to history');
});

app.get('/transactionHistory', (req, res) => {
    const history = transactionStack.getAll();
    res.json(history);
});

app.post('/undoTransaction', (req, res) => {
    const lastTransaction = transactionStack.pop();
    if (lastTransaction === 'Stack is empty') {
        res.send('No transaction to undo');
    } else {
        res.send(`Transaction undone: ${JSON.stringify(lastTransaction)}`);
    }
});

//FileHandling and logs
const path = require('path');

app.post('/generateInvoice', (req, res) => {
    const { type, amount } = req.body;
    if (!type || !amount) {
        return res.status(400).json({ error: 'Type and amount are required' });
    }

    const doc = new PDFDocument();
    const fileName = `invoice_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, fileName);

    try {
        doc.pipe(fs.createWriteStream(filePath));
        doc.text(`Invoice for ${type} bill`);
        doc.text(`Amount: ${amount}`);
        doc.text(`Date: ${new Date().toISOString()}`);
        doc.end();

        // Wait for the PDF file to be fully written before downloading
        doc.on('finish', () => {
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    res.status(500).json({ error: 'Error generating invoice' });
                } else {
                    fs.unlinkSync(filePath); // Optional: Clean up the file after download
                }
            });
        });
    } catch (error) {
        console.error('Error during PDF generation:', error);
        res.status(500).json({ error: 'An error occurred while creating the invoice' });
    }
});




app.post('/logTransaction', (req, res) => {
    const transaction = req.body; // { type, amount, date }
    fs.appendFile('transactions.json', JSON.stringify(transaction) + '\n', (err) => {
        if (err) return res.status(500).send('Error logging transaction');
        res.send('Transaction logged');
    });
});

//CSV functionality
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'transactions.csv', // The CSV file path
    header: [
        { id: 'type', title: 'TYPE' },
        { id: 'amount', title: 'AMOUNT' },
        { id: 'date', title: 'DATE' }
    ],
    append: true // To append new records instead of overwriting
});

app.post('/logTransactionCSV', (req, res) => {
    const transaction = req.body; // { type, amount, date }

    csvWriter.writeRecords([transaction])
        .then(() => {
            res.send('Transaction logged to CSV');
        })
        .catch(err => {
            res.status(500).send('Error writing to CSV');
        });
});
