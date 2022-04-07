import isValid from "./js/isValid.js";

// import moment from "moment-timezone";

// ----------------- EXPRESS SERVER -----------------
// const express = require('express')
import express, { json } from "express";
const app = express()
const port = 3003
app.listen(port, () => {
console.log(`Example app listening at http://localhost`)
})

// const cors = require('cors')
import cors from "cors";
app.use(cors())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());


app.use(cors({
    origin: '*'
}));

// ----------------- MY SQL CONNECT -----------------
// const mysql = require('mysql')
import mysql from "mysql";

const con = mysql.createConnection({
    host: process.env.Hostname,
    user: process.env.Username,
    password: process.env.Password,
    database: process.env.Database,
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
// -------------------------------------------------




// GET ALL RECORDS FROM TABLE
app.get('/stock/', (req, res) => {
    const sql = `
        select * from stock
    `
    con.query(sql, (err, results) => {
        if (err) throw err;
        // console.log(results);
        // console.log(moment.tz('2021-11-03T22:00:00.000Z', "Europe/Vilnius").format('YYYY-MM-DD'))
        // console.log('AAA ', results);
        // console.log('BBB ', fixDate(results));
        res.send(results);
    });
})


// INSERT NEW RECORD IN TABLE
app.post('/stock', (req, res) => {
    const sql = `
        insert into stock
        (product, type, quantity, price, instock, lastorder, waranty, forsale, description)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    if(
        isValid('txt', 'required', req.body.product) &&
        isValid('txt', 'required', req.body.type) &&
        isValid('num', 'required', req.body.quantity) &&
        isValid('num', 'required', req.body.price) &&
        isValid('num', 'optional', req.body.instock) &&
        isValid('txt', 'optional', req.body.lastorder.slice(0, 10)) &&
        isValid('num', 'optional', req.body.waranty) &&
        isValid('boolean', 'optional', req.body.forsale) &&
        isValid('txt', 'optional', req.body.description)
    ) {
        con.query(sql, [
            req.body.product, 
            req.body.type, 
            req.body.quantity, 
            req.body.price, 
            req.body.instock||'0', 
            req.body.lastorder.slice(0, 10)||'0001-01-01', 
            req.body.waranty, 
            req.body.forsale, 
            req.body.description
        ], (err, results) => {
            try {
                if (err) throw err;
                // console.log(results);
                res.send(results)
            } catch(err) {
                console.log('THIS IS HANDLED ERROR: ', err)
            }
        });
    } else console.log('BAD DATA');
})


// EDIT RECORD 
app.put('/stock/:id', (req, res) => {
    // console.log(req.body.lastorder);
    const sql = `
        UPDATE stock
        SET product = ?, type = ?, quantity = ?, price = ?, instock = ?, lastorder = ?, waranty = ?, forsale = ?, description = ?
        WHERE id = ?
    `;
    if(
        isValid('txt', 'required', req.body.product) &&
        isValid('txt', 'required', req.body.type) &&
        isValid('num', 'required', req.body.quantity) &&
        isValid('num', 'required', req.body.price) &&
        isValid('num', 'optional', req.body.instock) &&
        isValid('txt', 'optional', req.body.lastorder.slice(0, 10)) &&
        isValid('num', 'optional', req.body.waranty) &&
        isValid('boolean', 'optional', req.body.forsale) &&
        isValid('txt', 'optional', req.body.description) &&
        isValid('num', 'required', req.params.id)
    ) {
        con.query(sql, [
            req.body.product,
            req.body.type,
            req.body.quantity,
            req.body.price,
            req.body.instock,
            req.body.lastorder.slice(0, 10),
            req.body.waranty,
            req.body.forsale,
            req.body.description,
            req.params.id
        ], (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.send(results);
            } catch(err) {
                console.log('THIS IS HANDLED ERROR: ', err);
            }
        }) 
    } else console.log('BAD DATA');
})


// DELETE RECORD 
app.delete('/stock/:id', (req, res) => {
    const sql = `
        DELETE FROM stock
        WHERE id = ?
        `;
    con.query(sql, [req.params.id], (err, result) => {
        try {
            if (err) {
                throw err;
            }
            res.send(result);
        } catch(err) {
            console.log('THIS IS HANDLED ERROR: ', err);
        }
    })
})
// -------------------------------------------------




// FILTER CHECKBOX CONTENT - GET DISTINCT TYPES
app.get('/stock-types', (req, res) => {
    const sql = `
        SELECT DISTINCT type
        FROM stock
    `;
    con.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.send(results);
    })
})

// FILTER - GET DATA BY TYPE
app.get('/stock-filter/:t', (req, res) => {
    const sql = `
        SELECT *
        FROM stock
        WHERE type = ?
    `;
    con.query(sql, [req.params.t], (err, results) => {
        if (err) {
            throw err;
        }
        res.send(results);
    })
})


// SORT1 & FILTER MIX (SORT1)  
// app.get('/stock-filter/:t', (req, res) => {
//     // console.log(typeof req.params.t, req.params.t);
//     // console.log(req.params.t === '3');
//     let sql;
//     if(req.params.t === 'ASC') {
//         sql = `
//         SELECT * FROM stock
//         order by price ASC
//     `} else if(req.params.t === 'DESC') {
//         sql = `
//         SELECT * FROM stock
//         order by price DESC
//     `} else if(req.params.t === '1' || req.params.t === '0') {
//         sql = `
//         SELECT *
//         FROM stock
//         WHERE instock = ?
//     `;
//     }
    
//     con.query(sql, [req.params.t], (err, results) => {
//         if (err) {
//             throw err;
//         }
//         res.send(results);
//         // console.log(results)
//     })
// })

// SEARCH DATA
app.get('/stock-search', (req, res) => {
    const searchText = (`%${req.query.s}%`).toLowerCase();
    const sql = `
        SELECT *
        FROM stock
        where LOWER(product) like ? OR LOWER(type) like ? OR LOWER(type) like ? OR LOWER(quantity) like ? OR LOWER(price) like ? OR LOWER(instock) like ? OR LOWER(lastorder) like ? OR LOWER(waranty) like ? OR LOWER(forsale) like ? OR LOWER(description) like ?
    `;
    con.query(sql, [searchText, searchText, searchText, searchText, searchText, searchText, searchText, searchText, searchText, searchText], (err, results) => {
        if (err) {
            throw err;
        }
        res.send(results);
    })
})

// STATISTICS
app.get('/statistics', (req, res) => {
    
    let totalQuantity;
    let totalValue;
    let uniqueProducts;
    let avgPrice;
    let itmInStock;
    let itmOutStock;
    let groupStats;
    
    let sql = `
    SELECT 
    SUM(quantity) as totalQuantity,
    sum(quantity*price) as totalValue,
    COUNT(id) as uniqueProducts
    FROM stock
    where instock = '1';
    `;
    con.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        // res.send(results);
         
            totalQuantity = results[0].totalQuantity;
            totalValue = results[0].totalValue;
            uniqueProducts = results[0].uniqueProducts;
    });

    sql = `
    select 
    SUM(quantity) as itmInStock
    from stock
    where instock = '1';
    `;
    con.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        // res.send(results);
        itmInStock = results[0].itmInStock;
    });

    sql = `
    select 
    SUM(quantity) as itmOutStock
    from stock
    where instock = '0';
    `;
    con.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        // res.send(results);
         itmOutStock = results[0].itmOutStock;
    });

    sql = `
    select type, sum(quantity) as quantity
    from stock
    where instock = '1'
    group by type;
    `;
    con.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        // res.send(results);
        groupStats = results;
        res.send({
            totalQuantity,
            totalValue,
            uniqueProducts,
            avgPrice: totalValue/totalQuantity,
            itmInStock,
            itmOutStock,
            groupStats
        });
    });
})

// app.get('/group-statistics', (req, res) => {
//     const sql = `
//         SELECT COUNT(id) as count, type
//         FROM animals
//         GROUP BY type
//         ORDER BY COUNT(id) DESC, type
//     `;
//     con.query(sql, (err, results) => {
//         if (err) {
//             throw err;
//         }
//         res.send(results);
//     })
// })




// function fixDate(data) {
//     return data.map((e, i) =>  {
//         return({
//             id: i+1,
//             product: e.product,
//             quantity: e.quantity,
//             price: e.price,
//             instock: e.instock,
//             lastorder: moment.tz(e.lastorder, "Europe/Vilnius").format('YYYY-MM-DD')
//         })
//     })
// }