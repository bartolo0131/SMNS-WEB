
const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require('path');
const session = require("express-session");
const bcryptjs = require('bcryptjs'); 
const { error, time } = require("console");
const { name } = require("ejs");
const { fileURLToPath } = require("url");
import {router} from 'express'


const router= router()



//se renderisan las rutas que antes estanban en index se pasan se reemplaza la variable app por router 

router.get("/contacto", function(req, res) {
    res.render("contacto");
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.get("/perfil", function(req, res) {
    res.render("perfil");
});

router.get("/registro", function(req, res)  {
    res.render("registro")
});

export default router