from flask import Flask, request
from flask_restful import Resource, Api, abort
from marshmallow import ValidationError
import persistence
from exoplanet_schema import ExoplanetSchema
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

@app.before_first_request
def initialize_database():
    persistence.initialize()

class Exoplanet(Resource):
    def get(self, Id=None):
        if Id is None:
            return persistence.get_all()

        exoplanet = persistence.get(Id)
        if not exoplanet:
            abort(404, errors={"errors": {"message": "Exoplanet with Id {} does not exist".format(Id)}})
        return exoplanet

    def post(self):
        try:
            exoplanet = ExoplanetSchema(exclude=["id"]).loads(request.json)
            if not persistence.create(exoplanet):
                abort(404, errors={"errors": {"message": "Exoplanet with name {} already exists".format(request.json["name"])}})
        except ValidationError as e:
            abort(405, errors=e.messages)

    def put(self, Id):
        try:
            exoplanet = ExoplanetSchema(exclude=["id"]).loads(request.json)
            if not persistence.update(exoplanet, Id):
                abort(404, errors={"errors": {"message": "Exoplanet with Id {} does not exist".format(Id)}})
        except ValidationError as e:
            abort(405, errors=e.messages)

    def delete(self, Id):
        if not persistence.delete(Id):
            abort(404, errors={"errors": {"message": "Exoplanet with Id {} does not exist".format(Id)}})

api.add_resource(Exoplanet, "/exoplanets", "/exoplanets/<int:Id>")

if __name__ == "__main__":
    app.run(host="0.0.0.0")