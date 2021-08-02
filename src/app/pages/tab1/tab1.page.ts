import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private barcodeScanner: BarcodeScanner, private dataLocalServis: DataLocalService) { }


  scaner() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if (!barcodeData.cancelled) {
        this.dataLocalServis.guardarRegistro(barcodeData.format, barcodeData.text);
      }



    }).catch(err => {
      console.log('Error', err);
      // this.dataLocalServis.guardarRegistro('QRCode', 'https://lavanderiakyo.com');
      this.dataLocalServis.guardarRegistro('QRCode', 'geo:40.73151796986687,-74.06087294062502');

    });
  }

}
