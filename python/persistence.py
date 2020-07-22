from exoplanet_schema import ExoplanetSchema
import jaydebeapi
from pathlib import Path

driver_class = "org.h2.Driver"
jdbc_url = "jdbc:h2:tcp://localhost:5234/exoplanets"
credentials = ["SA", ""]
h2_jar = Path(__file__).absolute().parents[1] + "/h2-1.4.200.jar"

def initialize():
    _execute(
        ("CREATE TABLE IF NOT EXISTS exoplanets ("
         "  id INT PRIMARY KEY AUTO_INCREMENT,"
         "  name VARCHAR NOT NULL,"
         "  year_discovered SIGNED,"
         "  light_years FLOAT,"
         "  mass FLOAT,"
         "  link VARCHAR)"))

def get_all():
    return _execute("SELECT * FROM exoplanets", returnResult=True)

def get(Id):
    return _execute("SELECT * FROM exoplanets WHERE id = {}".format(Id), returnResult=True)

def create(exoplanet):
    count = _execute("SELECT count(*) AS count FROM exoplanets WHERE name LIKE '{}'".format(exoplanet.get("name")), returnResult=True)
    if count[0]["count"] > 0:
        return

    columns = ", ".join(exoplanet.keys())
    values = ", ".join("'{}'".format(value) for value in exoplanet.values())
    _execute("INSERT INTO exoplanets ({}) VALUES({})".format(columns, values))

    return {}

def update(exoplanet, Id):
    count = _execute("SELECT count(*) AS count FROM exoplanets WHERE id = {}".format(Id), returnResult=True)
    if count[0]["count"] == 0:
        return

    values = ["'{}'".format(value) for value in exoplanet.values()]
    update_values = ", ".join("{} = {}".format(key, value) for key, value in zip(exoplanet.keys(), values))
    _execute("UPDATE exoplanets SET {} WHERE id = {}".format(update_values, Id))

    return {}

def delete(Id):
    count = _execute("SELECT count(*) AS count FROM exoplanets WHERE id = {}".format(Id), returnResult=True)
    if count[0]["count"] == 0:
        return

    _execute("DELETE FROM exoplanets WHERE id = {}".format(Id))
    return {}

def _convert_to_schema(cursor):
    column_names = [record[0].lower() for record in cursor.description]
    column_and_values = [dict(zip(column_names, record)) for record in cursor.fetchall()]

    return ExoplanetSchema().load(column_and_values, many=True)

def _execute(query, returnResult=None):
    connection  = jaydebeapi.connect(driver_class, jdbc_url, credentials, h2_jar)
    cursor = connection.cursor()
    cursor.execute(query)
    if returnResult:
        returnResult = _convert_to_schema(cursor)
    cursor.close()
    connection.close()

    return returnResult