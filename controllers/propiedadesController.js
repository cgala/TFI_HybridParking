//importo mi emisor de eventos(patron observer)
import emitter from '../helpers/eventEmitter.js'

import { unlink } from 'node:fs/promises'
import { validationResult } from "express-validator"
import { Precio, Categoria, Propiedad} from '../models/index.js'

const admin = async(req,res) => {

    const { id } = req.usuario

    const propiedades = await Propiedad.findAll({
        where: {
            usuarioId : id
        },
        include: [
            {
                model: Categoria, as: 'categoria'
            },
            {
                model: Precio, as: 'precio'
            }
        ]
    })

    res.render('propiedades/admin', {
        pagina: 'Mis Garages',
        propiedades: propiedades,
        csrfToken: req.csrfToken()
    })
}

//formulario pare crear un garage
const crear = async (req, res) =>{
    //obtengo datos del modelo precio y categoria
    //promice . all en vez de solo await ejecuta en paralelo las consultas, await espera al primero para pasar al segundo
    //retorna los datos en el orden del array
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Garage',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {

    //validar resultado de la validacion que viene  de el routes de propiedades
    let resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        //consultamos al modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
        ])

        return res.render('propiedades/crear', {
        pagina: 'Crear Garage',
        categorias,
        precios,
        csrfToken: req.csrfToken(),
        errores: resultado.array(),
        datos:req.body
        })
    }

    // Crear un Registro
    const { titulo, descripcion, electrico, alarma, expensa, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
    const { id: usuarioId } = req.usuario

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            electrico, 
            alarma, 
            expensa,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })
        
        const { id } = propiedadGuardada
        // Loguea la creación del registro guardado usando el PATRON OBSERVER
        emitter.emit('propertyCreated', {
            id: id,
            titulo:titulo
        })


        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }   
}

const agregarImagen = async (req, res) => {

    //validar que la propiedad exista
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //validar que la porpiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad pertenece a quien visita esta pagina
    //valida que el id del usuario logeado sea igual al id del usuario que creo la propiedad
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
        
    })
}

const almacenarImagen = async(req, res, next)=> {
    //validar que la propiedad exista
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //validar que la porpiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad pertenece a quien visita esta pagina
    //valida que el id del usuario logeado sea igual al id del usuario que creo la propiedad
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        //req.file, permite ver el archivo subido
        //console.log(req.file)


        //almacenar imagen (ruta, no la la img en si) y publicar garage
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()
        next()

    } catch (error) {
        console.log(error)
    }
}

const editar = async (req, res) => {

    const { id } = req.params

    //validar la existencia de la propiedad - garage
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // chequear que el que visita la propiedad sea el mismo que la creo
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //obtengo datos del modelo precio y categoria
    //promice . all en vez de solo await ejecuta en paralelo las consultas, await espera al primero para pasar al segundo
    //retorna los datos en el orden del array
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: 'Editar Garage',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {
    //validar resultado de la validacion
    let resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        //consultamos al modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
        ])

        res.render('propiedades/editar', {
        pagina: `Editar Garage: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        errores: resultado.array(),
        datos: req.body
        })
    }

    const { id } = req.params

    //validar la existencia de la propiedad - garage
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // chequear que el que visita la propiedad sea el mismo que la creo
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //actualizar el objeto
    try {
        const { titulo, descripcion, electrico, alarma, expensa, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
        const { id: usuarioId } = req.usuario

        propiedad.set({
            titulo,
            descripcion,
            electrico,
            alarma,
            expensa,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })

        //guardo en la base
        await propiedad.save()

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req, res) =>{
     const { id } = req.params

    //validar la existencia de la propiedad - garage
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // chequear que el que visita la propiedad sea el mismo que la creo
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)
    console.log("se elimino la imagen")

    //aplico el PATRON OBSERVER para general log al eliminar una propiedad
    emitter.emit('propertyDeleted', {
        id: propiedad.id,
        titulo: propiedad.titulo
    })

    //eliminar el garage
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
    console.log("se elimino el garage")
}

export{
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar
}