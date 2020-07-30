var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['../h2-1.4.200.jar']);
}

var h2 = new JDBC({
  url: 'jdbc:h2:tcp://localhost:5234/exoplanets;database_to_lower=true',
  drivername: 'org.h2.Driver',
  properties: {
    user : 'SA',
    password: ''
  }
});

var h2Init = false;

function getH2(callback) {
  if (!h2Init)
    h2.initialize((err) => {
      h2Init = true;
      callback(err)
    });
  return callback(null);
};

function queryDB(sql, callback) {
  h2.reserve((err, connobj) => {
    connobj.conn.createStatement((err, statement) => {
      if(callback) {
        statement.executeQuery(sql, (err, result) => h2.release(connobj, (err) => callback(result)));
      } else {
        statement.executeUpdate(sql, (err) => h2.release(connobj, (err) => { if(err) console.log(err) }));
      }
    });
  });
};

module.exports = {
  initialize: function(callback) {
    getH2((err) => {
      queryDB("CREATE TABLE IF NOT EXISTS exoplanets ("
        + "  id INT PRIMARY KEY AUTO_INCREMENT,"
        + "  name VARCHAR NOT NULL,"
        + "  year_discovered SIGNED,"
        + "  light_years FLOAT,"
        + "  mass FLOAT,"
        + "  link VARCHAR)"
      );
    });
  },
  getAll: function(callback) {
    getH2((err) => queryDB("SELECT * FROM exoplanets", (result) => {
      result.toObjArray((err, results) => callback(results))
    }));
  },
  get: function(id, callback) {
    getH2((err) => queryDB(`SELECT * FROM exoplanets WHERE id = ${id}`, (result) => {
      result.toObjArray((err, results) => { return callback(results); })
    }));
  },
  create: function(exoplanet) {
    getH2((err) => {
      columns = Object.keys(exoplanet).join();
      Object.keys(exoplanet).forEach((key) => exoplanet[key] = `'${exoplanet[key]}'`);
      values = Object.values(exoplanet).join();

      queryDB(`INSERT INTO exoplanets (${columns}) VALUES(${values})`);
    });
  },
  update: function(id, exoplanet) {
    getH2((err) => {
      keyValues = []
      Object.keys(exoplanet).forEach((key) => keyValues.push(`${key} = '${exoplanet[key]}'`));

      queryDB(`UPDATE exoplanets SET ${keyValues.join()} WHERE id = ${id}`);
    });
  },
  delete: function(id) {
    getH2((err) => queryDB(`DELETE FROM exoplanets WHERE id = ${id}`));
  },
};
