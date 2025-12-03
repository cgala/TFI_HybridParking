import express from "express"
import { body } from "express-validator"
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar } from "../controllers/propiedadesController.js"
import protegerRuta from "../middleware/protegerRuta.js"
import upload from "../middleware/subirimagen.js"

const router = express.Router()

//el middleware de protegerRuta tambien permite utilizar las variables que almacenan datos de la base, por
//ejemplo a req.usuario dentro de una funcion que se define como (req,res)

router.get('/mis-propiedades', protegerRuta,admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion es obligatoria').isLength({max: 200 }).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('electrico').isIn(['si', 'no']).withMessage('Selecciona si el garaje es apto electrico'),
    body('alarma').isIn(['si', 'no']).withMessage('Selecciona si el espacio cuenta con alarma'),
    body('expensa').isIn(['si', 'no']).withMessage('Selecciona si el espacio paga expensas'),
    body('lat').isNumeric().withMessage('Ubica el garage en el mapa'),
    guardar)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)

router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion es obligatoria').isLength({max: 200 }).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('electrico').isIn(['si', 'no']).withMessage('Selecciona si el garaje es apto electrico'),
    body('alarma').isIn(['si', 'no']).withMessage('Selecciona si el espacio cuenta con alarma'),
    body('expensa').isIn(['si', 'no']).withMessage('Selecciona si el espacio paga expensas'),
    body('lat').isNumeric().withMessage('Ubica el garage en el mapa'),
    guardarCambios)

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
)


export default router