import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PRIVATE_MERCHANT_ID = process.env.PRIVATE_MERCHANT_ID;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/charge', async (req, res) => {
  try {
    const { token, amount, contactDetails } = req.body;

    if (!token || !amount || !contactDetails) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    const response = await fetch('https://api-uat.kushkipagos.com/card/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Private-Merchant-Id': PRIVATE_MERCHANT_ID
      },
      body: JSON.stringify({ token, amount, contactDetails })
    });

    const data = await response.json();

    if (data.ticketNumber) {
      res.json({ status: 'approved', details: data });
    } else {
      res.json({ status: 'declined', details: data });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Error procesando el pago' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});