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
})
options({ stripUnknown: true });

app.get('/exoplanets', (req, res) => persistence.getAll((result) => res.send(result)));

app.get('/exoplanets/:id', (req, res) => {
    persistence.get(req.params.id, (result) => {
        if(result)
            res.send(result);
        else
            res.status(404);
    });
});

app.post('/exoplanets', (req, res) => {
    delete req.body.id;
    const { error, value } = exoplanetSchema.validate(req.body);
    if(error)
        res.status(405).send(error.details[0].message);

    persistence.create(value);
    res.status(201);
});

app.put('/exoplanets/:id', (req, res) => {
    delete req.body.id;
    const { error, value } = exoplanetSchema.validate(req.body);
    if(error) {
        res.status(405).send(error.details[0].message);
    }

    persistence.get(req.params.id, (result) => {
        if(result) {
            persistence.update(req.params.id, value);
            res.status(201);
        } else {
            res.status(404);
        }
    });
});

app.delete('/exoplanets/:id', (req, res) => {
    persistence.get(req.params.id, (result) => {
        if(result) {
            persistence.delete(req.params.id);
            res; 
        } else {
            res.status(404);
        }            
    });
});

app.listen(5000, () => {
    persistence.initialize();
    console.log("Exoplanets API listening at http://localhost:5000")
});