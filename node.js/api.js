const persistence = require('./persistence');
const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const app = express();

app.use(cors());
app.use(express.json());

const exoplanetSchema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    year_discovered: Joi.number(),
    light_years: Joi.number(),
    mass: Joi.number(),
    link: Joi.string().uri()
});

app.get('/exoplanets', (req, res) => persistence.getAll((result) => res.send(result)));

app.get('/exoplanets/:id', (req, res) => {
    persistence.get(req.params.id, (result) => {
        if(result.length == 1)
            res.send(result[0]);
        else
            res.status(404).send();
    });
});

app.post('/exoplanets', (req, res) => {
    delete req.body.id;
    const { error, value } = exoplanetSchema.validate(req.body);
    if(error)
        res.status(405).send(error.details[0].message);

    persistence.create(value);
    res.status(201).send();
});

app.put('/exoplanets/:id', (req, res) => {
    delete req.body.id;
    const { error, value } = exoplanetSchema.validate(req.body);
    if(error) {
        res.status(405).send(error.details[0].message);
    }

    persistence.get(req.params.id, (result) => {
        if(result.length == 1) {
            persistence.update(req.params.id, value);
            res.status(201).send();
        } else {
            res.status(404).send();
        }
    });
});

app.delete('/exoplanets/:id', (req, res) => {
    persistence.get(req.params.id, (result) => {
        if(result.length == 1) {
            persistence.delete(req.params.id);
            res.send(); 
        } else {
            res.status(404).send();
        }            
    });
});

app.listen(5000, () => {
    persistence.initialize();
    console.log("Exoplanets API listening at http://localhost:5000")
});