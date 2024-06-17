require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require('path');

app.use(express.static('public'));
app.use(bodyParser.json());

const obtenerFechaActual = () => {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = String(fecha.getFullYear()).slice(-2);
    return `${dia}/${mes}/${año}`;
}

// data = req.body
const actualizarJson = (nombre, data, callBack) => {
    const dataPath = path.join(__dirname, nombre);
    let newData = data;

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return callBack({ error: 'Error leyendo el archivo JSON' });
        }

        let jsonData = JSON.parse(data);
        jsonData.push(newData);

        fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                return callback({ error: 'Error escribiendo en el archivo JSON' });
            }

            callBack({ message: 'Datos agregados con éxito' });
        });
    });
}
const borrarCarro = (callback) => {

    const dataPath = path.join(__dirname, "Carrito.json");
    let newData = [];
    fs.writeFile(dataPath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            return callback({ error: 'Error escribiendo en el archivo JSON' });
        }

        callback({ message: 'Datos eliminados con éxito' });
    });


}
const leerJson = (nombre, callBack) => {
    const dataPath = path.join(__dirname, nombre);
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return callBack({ error: 'Error leyendo el archivo JSON' });
        }

        let jsonData = JSON.parse(data);
        callBack({ data: jsonData });
    });
}

app.get("/empleados", (req, res) => {
    leerJson("empleados.json", ({ error, data }) => {
        if (error) return res.status(400).json(error);
        else return res.json(data);
    });
});

app.post("/empleados", (req, res) => {
    let data = req.body;
    data["fecha"] = obtenerFechaActual();
    actualizarJson("empleados.json", req.body, ({ error, message }) => {
        if (error) return res.status(400).json({ error });
        else return res.json({ message });
    });
});

app.get("/carrito", (req, res) => {
    leerJson("Carrito.json", ({ error, data }) => {
        if (error) return res.status(400).json(error);
        else {
            res.json(data);
        }
    });
})

app.post("/carrito", (req, res) => {
    actualizarJson("Carrito.json", req.body, ({ error, message }) => {
        if (error) return res.status(400).json({ error });
        else return res.json({ message });
    })
})

app.get("/borrarCarrito/:tar", (req, res) => {
    leerJson("Carrito.json", ({ error, data }) => {
        if (error) return console.log(error);
        let tot = 0;
        data.forEach((elem) => {
            tot += elem.total;
        })
        actualizarJson("ventas.json", {fecha: obtenerFechaActual(), total: tot, tarjeta: req.params.tar}, () => {})

        borrarCarro(({ error, message }) => {
            if (error) return res.status(400).json({ error });
            else {
                res.json({ message });
            }
        });
    })
    
})

app.get("/ventas", (req, res) => {
    leerJson("ventas.json", ({ error, data }) => {
        if (error) return res.status(400).json({ error });
        else return res.json(data);
    })
})

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("escuchando en el puerto " + port);
})