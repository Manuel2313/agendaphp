const formularioContactos = document.querySelector('#contacto'),
    listadoContactos = document.querySelector('#listado-contactos tbody'),
    inputBuscador = document.querySelector('#buscar');

eventListeners();



function eventListeners() {
    //Cuando el formulario de crear o editar se ejecuta
    formularioContactos.addEventListener('submit', leerFormulario);

    if(listadoContactos){
        listadoContactos.addEventListener('click', eliminarContacto);
    }

    inputBuscador.addEventListener('input', buscarContactos);


    numeroContactos();
}

function leerFormulario(e) {
    e.preventDefault();
    // console.log("presionaste");

    //leer los datos de los input
    const nombre = document.querySelector('#nombre').value,
        telefono = document.querySelector('#telefono').value,
        empresa = document.querySelector('#empresa').value,
        accion = document.querySelector('#accion').value;

    if (nombre === '' || telefono === '' || empresa === '') {
        mostrarNotificacion('Todos los Campos son Obligatorios', 'error');

    } else {
        const infoContancto = new FormData();
        infoContancto.append('nombre', nombre);
        infoContancto.append('empresa', empresa);
        infoContancto.append('telefono', telefono);
        infoContancto.append('accion', accion);
        // console.log(...infoContancto);

        if (accion === 'crear') {
            //crearemos un nuevo contacto
            insertarBD(infoContancto);
        } else {
            //editar el contacto
            //leer el Id 
            const idRegistro = document.querySelector('#id').value;
            infoContancto.append('id', idRegistro);
            actualizarRegistro(infoContancto); 
        }
    }

}
/** Inserta en la base de datos via ajax */
function insertarBD(datos) {
    //llamado a ajax

    //crear el objeto
    const xhr = new XMLHttpRequest();

    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);


    //pasar los datos
    xhr.onload = function () {
        if (this.status == 200) {

            //leemos la respuesta de php
            const respuesta = JSON.parse(xhr.responseText);
            // console.log(xhr.responseText);

            const nuevoContacto = document.createElement('tr');
            //Insertar nuevo elemento a la tabla
            nuevoContacto.innerHTML = `
            <td>${respuesta.datos.nombre}</td>
            <td>${respuesta.datos.empresa}</td>
            <td>${respuesta.datos.telefono}</td>
            `;

            //Crear contenedor para 
            const contenedorAccion = document.createElement('td');
            const iconoEditar = document.createElement('i');
            iconoEditar.classList.add('fas', 'fa-pen-square');


            //crea el enlace para editar 
            const btnEditar = document.createElement('a');
            btnEditar.appendChild(iconoEditar);
            btnEditar.href = `editar.php?id=${respuesta.datos.id_insertado}`;
            btnEditar.classList.add('btn', 'btn-editar');

            //agregarlo al padre
            contenedorAccion.appendChild(btnEditar);


            //crear el icono de eliminar
            const iconoEliminar = document.createElement('i');
            iconoEliminar.classList.add('fas', 'fa-trash-alt');

            //crear el boton eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.appendChild(iconoEliminar);
            btnEliminar.setAttribute('data-id', respuesta.datos.id_insertado);
            btnEliminar.classList.add('btn', 'btn-borrar');
            //agregarlo al padre
            contenedorAccion.appendChild(btnEliminar);

            //agregarlo al tr
            nuevoContacto.appendChild(contenedorAccion);
            //agregarlo con los contactos
            listadoContactos.appendChild(nuevoContacto);

            //resetear el form
            document.querySelector('form').reset();
            //mostrar la notificacion

            mostrarNotificacion('Contacto creado correctamente', 'correcto');

            numeroContactos();
        }
    }


    //enviar los datos
    xhr.send(datos);
}

function actualizarRegistro(datos){
    //crear el objeto
    const xhr = new XMLHttpRequest();
    //abrir la conexion
    xhr.open('POST' ,'inc/modelos/modelo-contactos.php', true);
    //leer la respuesta
    xhr.onload = function(){
        if(this.status ===200){
           const respuesta = JSON.parse(xhr.responseText); 
           if(respuesta.respuesta === 'correcto'){
               //mostrar notificacion
               mostrarNotificacion('Contacto Editado Correctamente', 'correcto');
           }else{
               mostrarNotificacion('Hubo un error', 'error');
           } 
           setTimeout(() => {
                window.location.href = 'index.php';
           }, 3000);
        }

    }
    //enviar la peticion
    xhr.send(datos);
}

function eliminarContacto(e) {
    if (e.target.parentElement.classList.contains('btn-borrar')) {
        //tomar el ID
        const id = e.target.parentElement.getAttribute('data-id');
        console.log(id);

        //preguntar al usuario
        const respuesta = confirm('¿Estas seguro?');

        if (respuesta) {
            //llamado a ajax
            //crear el objeto
            const xhr = new XMLHttpRequest();

            //abrir la conexion
            xhr.open('GET', `inc/modelos/modelo-contactos.php?id=${id}&accion=borrar`, true);

            //Leer la respuesta
            xhr.onload = function () {
                if (this.status == 200) {
                    const resultado = JSON.parse(xhr.responseText);
                    if (resultado.respuesta === 'correcto') {
                        //eliminar el registro del DOM
                        console.log();
                        e.target.parentElement.parentElement.parentElement.remove();
                        //mostrar notificacion
                        mostrarNotificacion('Contacto eliminado', 'correcto');
                        numeroContactos();
                    } else {
                        //mostramos una notificacion
                        mostrarNotificacion("Hubo un error...", 'error');
                    }
                }
            }

            //enviar la peticion
            xhr.send();
        }


    }
}
//notificacion en pantalla
function mostrarNotificacion(mensaje, clase) {
    const notificacion = document.createElement('div');
    notificacion.classList.add(clase, 'notificacion', 'sombra');
    notificacion.textContent = mensaje;

    //formulario
    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));

    //ocultar y mostrar notificacion
    setTimeout(() => {
        notificacion.classList.add('visible');
        setTimeout(() => {
            notificacion.classList.remove('visible');

            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }, 100);


}

function buscarContactos(e){
    const expresion = new RegExp(e.target.value, "i");
    const registros = document.querySelectorAll('tbody tr');
    registros.forEach(registro =>{
        registro.style.display = 'none';
        // console.log(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1); 
            if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
                registro.style.display = 'table-row';
            }   
              numeroContactos();
        })
}

function numeroContactos(){
    const totalContactos = document.querySelectorAll('tbody tr'),
          contenedorNumero = document.querySelector('.total-contactos span');  

    let total =0;
    totalContactos.forEach(contacto => {
       if(contacto.style.display === '' || contacto.style.display === 'table-row'){
           total++;
       }
    });
    // console.log(total);
    contenedorNumero.textContent = total;
}