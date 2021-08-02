import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { writeFile } from 'fs';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
  ) {
    this.init();
    this.cargarStorage();
  }

  async init() {
    await this.storage.create();
  }

  async cargarStorage() {

    this.guardados = await this.storage.get('registros') || [];
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {
      case 'http':
        this.iab.create(registro.text, '_system');
        break;
      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
      default:
        break;
    }
  }

  enviarCorreo() {

    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en. Texto\n';
    arrTemp.push(titulos);
    this.guardados.forEach(r => {

      const linea = `${r.type}, ${r.format}, ${r.created}, ${r.text.replace(',', ' ')}\n`;
      arrTemp.push(linea);

    });

  }

  crearArchivoFisico(text: string) {

    this.file.checkFile(this.file.dataDirectory, 'registro.csv')
      .then(existe => {
        return this.escribirEnArchivo(text);
      }).catch(err => {
        return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
          .then(creado => this.escribirEnArchivo(text))
          .catch(err2 => console.log('No se pudo crear el archivo', err2));
      });

  }

  async escribirEnArchivo(text: string) {

    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);

    let archivo = `${this.file.dataDirectory}registros.csv`;

    let email = {
      to: 'pacoyx@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
      ],
      subject: 'Backup scans',
      body: 'doing backup <h2>scans</h2>',
      isHtml: true
    }

    // Send a text message using default options
    this.emailComposer.open(email);

  }

}
