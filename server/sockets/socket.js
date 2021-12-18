const { io } = require('../server');
const { Usuario } = require('../classes/usuario');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuario();


io.on('connection', (client) => {

    console.log('Usuario conectado');

    client.on('entrarChat', (data, callback) => {
        //console.log(data);
        if((!data.nombre) || (!data.sala)){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }
        //Unir a una sala
        client.join(data.sala);

        let personas = usuarios.agregarPersonas(client.id, data.nombre, data.sala);
        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonaPorSala(data.sala));

        callback(usuarios.getPersonaPorSala(data.sala));
    });

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', {usuario: 'Administrador', mensaje: `${personaBorrada.nombre} abandono el chat`});
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonas());
    });

    //Mensajes Privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    })


});