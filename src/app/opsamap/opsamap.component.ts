import { Component, ElementRef, ViewChild, OnInit, Inject } from '@angular/core';
import { loadModules } from 'esri-loader';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

export interface DialogData {
  error: string;
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
export interface trdata {
  PEA_TR: string;
  LOCATION: string;
  RATEKVA: number;
  PLoadTOT: number;
  cntOMS: number;
}

export interface meterdata2 {
  FACILITYID: string;
  peaMeter: string;
  kwh: number;
  custName: string;
  voltage: number;
  rate: string;
  rateMeter: string;
  // SUBTYPECOD: number;
  // Line_Type: string;
  // Feeder: number;
}

@Component({
  selector: 'app-opsamap',
  templateUrl: './opsamap.component.html',
  styleUrls: ['./opsamap.component.css']
})
export class OpsamapComponent implements OnInit {
  title = 'opsa';

  tr100 = [];
  tr80 = [];
  tr40 = [];
  tr = [];
  meter = [];
  geotr100 = [];
  geotr80 = [];
  geotr40 = [];
  geotr = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('sort2', { static: true }) sort2: MatSort;

  @ViewChild('elemMap', { static: false }) elemMap: ElementRef;
  @ViewChild('measurement', { static: false }) measurement: ElementRef;
  @ViewChild('f', { static: true }) registerForm: NgForm;

  x: number;
  y: number;
  map: any;
  result: any;
  serviceUrlTile =
    'http://gisn2.pea.co.th/arcgis/rest/services/PEA_CACHE_NOSTRA/MapServer';
  serviceUrlDynamic =
    'http://gisn2.pea.co.th/arcgis/rest/services/PEA/MapServer';
  //serviceUrlDynamic = 'http://gisn2.pea.co.th/arcgis/rest/services/EIS/EIS_PEA/MapServer';
  serviceUrlTrace =
    'http://gisn2.pea.co.th/arcgis/rest/services/PEA/MapServer/exts/TraceDownHV_LV/TraceDownHV_LV';

  traceReslt: any;
  TrResult: any;

  dataSource = new MatTableDataSource<trdata>();
  public dataSource2 = new MatTableDataSource<meterdata2>();
  displayedColumns: string[] = [
    'PEA_TR',
    'kva',
    'LOCATION',
    'cntOMS',
    'PLoadTOT',
    'status'
    // 'rundate',
    //'LOCATION',
  ];
  displayedColumns2 = ['see', 'cal', 'FACILITYID', 'peaMeter', 'custName', 'kwh', 'rate', 'rateMeter', 'voltage'];
  Conditions = [
    //{value: 0,viewvalue: 'หม้อแปลงทั้งหมด'},
    { value: "load", viewvalue: 'Load>80% หรือ Load<40%' },
    { value: "voltage", viewvalue: 'V<200 Volt' },
    { value: "UB", viewvalue: 'Unbalance>20%' },
    //{value: "80",viewvalue: 'หม้อแปลงที่มีโหลดตั้งแต่ 80-100%'},
    //{value: "40",viewvalue: 'หม้อแปลงที่มีโหลดต่ำกว่า 40%'} 
  ];
  peaname2 = [];
  selPea = '';
  selPeaName = 'กฟน.2';
  selPeapeaCode = '';
  currentMatherPea = "";
  peaCode = "xxx";
  selCondition = 'load';
  animal: string;
  name: string;

  constructor(private http: HttpClient, public dialog: MatDialog) { }
  ngOnInit() {
    this.getXY();
    this.getpeaName();
    this.createMap();
    //this.createTable();
  }
  onSubmit() {

    /*if(data['status']==1){
      this.registerForm.resetForm();
      this.getData();
      alert("เก็บข้อมูลแล้วเสร็จ");
    }else{
    alert(data.data);
    }*/
   
    this.http.get('http://172.30.212.148/opsaservice/serchmeter.php?PEA_Meter=' + this.registerForm.value.PEAMeter)
      //this.configService.getTr('TR.php?condition='+this.condition+'&peaCode0='+'B00000')
      .subscribe(res => {

        this.registerForm.resetForm();
        this.dataSource2.data = res as meterdata2[];
        this.dataSource2.paginator = this.paginator2;
        this.dataSource2.sort = this.sort2;

      })
  }
  exportAsXLSX():void {
    this.exportAsExcelFile(this.dataSource.data, 'TR');
 }
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
 }
  openDialog(error): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '500px',
      data: { error: error }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  selectPea(event) {
    this.peaCode = event.value[0];
    // this.map.destroy();
    // this.createMap();
    //this.map.graphics.clear();
    //this.getpeaName();
    //console.log(event.value[0])
    //this.map.graphics.clear();
    //this.map.clear();
    this.getXY();
    //this.createMap();
  }
  selectCondition(event) {
    this.selCondition = event.value[0];
    this.map.destroy();
    this.createMap();
    //this.map.graphics.clear();
    //this.map.graphics.clear();
    //this.map.clear();
    this.getXY();
    //this.createMap();
  }
  getpeaName() {
    var PeaNameURL = 'http://172.30.212.148/apsalv/PEANAME.php';
    this.http.get(PeaNameURL).subscribe((data => {
      if (data['status'] == 1) {
        data['data'].forEach(element => {
          this.peaname2.push([element.PEANAME, element.aoj])
        });
      } else {
        alert(data['data']);
      }
      console.log(this.peaname2)
      //this.getXY();
    }))

  }
  getXY() {
    //this.createMap();

    var TraceURL = 'http://172.30.212.148/apsalv/TROPSA.php?peaCode=' + this.peaCode;
    //var peatr = [];
    this.http.get(TraceURL).subscribe((resptr) => {
      this.tr100 = [];
      this.tr80 = [];
      this.tr40 = [];

      this.geotr100 = [];
      this.geotr80 = [];
      this.geotr40 = [];

      //console.log(resptr);
      (resptr as any).forEach((element) => {
        if (Number(element.cntAPSA) > 0) {
          this.tr40.push(element.PEA_TR);
          this.geotr40.push([element.x, element.y]);
        } else{
          this.tr100.push(element.PEA_TR);
          this.geotr100.push([element.x, element.y]);
        }

      });
    console.log(this.geotr40)
    // console.log(this.geotr80)
    console.log(this.geotr100)
      this.map.destroy();
      this.createMap();
    });

    // console.log(this.geotr40)
    // console.log(this.geotr80)
    // console.log(this.geotr100)
    //this.createMap();
    this.createTable()
    //this.createMap();
    //this.map.graphics.clear();
    //this.onMapLoad();

  }

  createMap() {
    loadModules(['esri/map', 'esri/basemaps', 'esri/dijit/Measurement', 'esri/units', 'dojo/dom']).then(([Map, Basemaps, Measurement, units, dom]) => {
      Basemaps.nostra = { baseMapLayers: [{ url: this.serviceUrlTile }] }; // add custom basemaps
      var option = {
        basemap: 'nostra', // set name of basemaps
        center: [100.323, 16.872],
        //zoom: 1
      };

      this.map = new Map(this.elemMap.nativeElement, option);
      this.map.on('click', (event: any) => this.onMapClick(event));

      this.map.on('load', () => this.onMapLoad());
      //var measurement = new Measurement({
      //  map: this.map,
      //  defaultAreaUnit: units.SQUARE_METERS,
      //  defaultLengthUnit: units.METERS
      //},dom.byId("measurement"));
      //this.map.on('load', () => measurement.startup());
    });
  }
  onMapLoad() {
    loadModules([
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/graphic',
      'esri/geometry/Point',
      'esri/InfoTemplate',
      'esri/geometry/Multipoint',
      'esri/SpatialReference',
      'esri/geometry/webMercatorUtils',
      'esri/symbols/TextSymbol',
      'esri/geometry/Extent',
      'esri/dijit/Measurement',
      'esri/units',
      'esri/layers/MapImage'
    ]).then(
      ([
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Color,
        Graphic,
        Point,
        Multipoint,
        SpatialReference,
        TextSymbol,
        Extent,
        Measurement,
        units,
        MapImage
      ]) => {

        this.addLayer();

        var line = new SimpleLineSymbol();
        line.setColor(new Color([0, 0, 0, 1]));

        var markertr100 = new SimpleMarkerSymbol();
        markertr100.setStyle(SimpleMarkerSymbol.STYLE_TRIANGLE);
        markertr100.setColor(new Color([255, 0, 0, 0.75]));
        markertr100.setOutline(line);
        markertr100.setSize(15);

        var markertr80 = new SimpleMarkerSymbol();
        markertr80.setStyle(SimpleMarkerSymbol.STYLE_TRIANGLE);
        markertr80.setColor(new Color([255, 255, 0, 0.75]));
        markertr80.setOutline(line);
        markertr80.setSize(15);

        var markertr40 = new SimpleMarkerSymbol();
        markertr40.setStyle(SimpleMarkerSymbol.STYLE_TRIANGLE);
        markertr40.setColor(new Color([0, 255, 0, 0.75]));
        markertr40.setOutline(line);
        markertr40.setSize(15);

        var mptr100 = new Multipoint(new SpatialReference({ wkid: 102100, latestWkid: 3857 }));
        mptr100.points = this.geotr100;
        var graphicmptr100 = new Graphic(mptr100, markertr100);
        //this.map.centerAndZoom([100.323, 16.872], 3).then(() => {
        //}); 

        var mptr80 = new Multipoint(new SpatialReference({ wkid: 102100, latestWkid: 3857 }));
        mptr80.points = this.geotr80;
        var graphicmptr80 = new Graphic(mptr80, markertr80);

        var mptr40 = new Multipoint(new SpatialReference({ wkid: 102100, latestWkid: 3857 }));
        mptr40.points = this.geotr40;
        var graphicmptr40 = new Graphic(mptr40, markertr40);

        console.log(graphicmptr40);
        //console.log(graphicmptr80)
        console.log(graphicmptr100);

        this.map.centerAndZoom([100.323, 17.150], 3);
        this.map.graphics.add(graphicmptr100);
        this.map.graphics.add(graphicmptr40);
        //this.map.graphics.add(graphicmptr80);
       
        var mi = new MapImage({
          'extent': { 'xmin': -8864908, 'ymin': 3885443, 'xmax': -8762763, 'ymax': 3976997, 'spatialReference': { 'wkid': 3857 } },
          'href': './asset/kaws.JPG'
        });
      }
    );
  }

  onMapClick(event: any) {
    this.doIdentify(event.mapPoint);
  }

  addLayer() {
    loadModules(['esri/layers/ArcGISDynamicMapServiceLayer']).then(
      ([ArcGISDynamicMapServiceLayer]) => {
        var layer = new ArcGISDynamicMapServiceLayer(this.serviceUrlDynamic);
        layer.setVisibleLayers([17, 19, 25, 26, 22, 28]);

        this.map.addLayer(layer);

      }
    );
  }

  /*addGraphic(mapPoint: any) {
    loadModules([
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/SpatialReference',
      'esri/geometry/Point',
      'esri/Color',
      'esri/graphic',
    ]).then(([SimpleMarkerSymbol, SimpleLineSymbol, Color, Graphic]) => {
      var line = new SimpleLineSymbol();
      line.setColor(new Color([38, 115, 0, 1]));
      var marker = new SimpleMarkerSymbol();
      marker.setStyle(SimpleMarkerSymbol.STYLE_CYCLE);
      marker.setColor(new Color([255, 0, 0, 0.5]));
      marker.setOutline(line);
      marker.setSize(50);
      var graphic = new Graphic(mapPoint, marker);
      this.map.graphics.clear();
      this.map.graphics.add(graphic);
    });
  }*/

  doIdentify(mapPoint: any) {
    loadModules([
      'esri/InfoTemplate',
      'esri/tasks/IdentifyTask',
      'esri/tasks/IdentifyParameters',
      'esri/graphic',
    ]).then(
      async ([InfoTemplate, IdentifyTask, IdentifyParameters, Graphic]) => {
        var identTask = new IdentifyTask(this.serviceUrlDynamic);
        var identParams = new IdentifyParameters();
        identParams.geometry = mapPoint;
        identParams.layerIds = [17, 25, 26];
        //identParams.layerIds = [41];
        identParams.tolerance = 5;
        identParams.returnGeometry = true;
        identParams.width = this.map.width;
        identParams.height = this.map.height;
        identParams.mapExtent = this.map.extent;
        identParams.spatialReference = this.map.spatialReference;
        identTask.execute(
          identParams,
          (response: any) => {
            var graphics = [];
            response.forEach((element: any) => {
              var graphic = new Graphic(element.feature.geometry);
              if (!element.feature.attributes.hasOwnProperty('PEANO')) {
                var content =
                  'PEA มิเตอร์: ${PEA มิเตอร์} <br/> รหัส TAG: ${รหัส TAG} <br/> สถานที่: ${สถานที่} <br/> เฟสมิเตอร์: ${เฟสที่ติดตั้ง}';
                var template = new InfoTemplate('รายละเอียด', content);
              } else {
                var content =
                  'PEA หม้อแปลง: ${PEANO} <br/> รหัส TAG: ${รหัส TAG} <br/> สถานที่: ${สถานที่} <br/> เจ้าของหม้อแปลง: ${เจ้าของหม้อแปลง}';
                var template = new InfoTemplate('รายละเอียด', content);
              }

              //const template = new InfoTemplate(); -> รายละเอียดมาทั้งหมด
              console.log(element.feature.attributes)
              graphic.setAttributes(element.feature.attributes);
              graphic.setInfoTemplate(template);
              graphics.push(graphic);
            });
            this.map.infoWindow.clearFeatures();
            this.map.infoWindow.setFeatures(graphics);
            this.map.infoWindow.show(mapPoint);
          },
          (error: any) => {
            alert('identTask Error: ' + error);
          }
        );
      }
    );
  }
  findtr(peaTR) {
    var TraceURL = 'http://172.30.212.148/opsaservice/findtr.php?FACILITYID=' + peaTR;
    this.http.get<trdata[]>(TraceURL).subscribe((resptr) => {
      this.dataSource.data = resptr as trdata[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  createTable() {
    var TraceURL = 'http://172.30.212.148/apsalv/TROPSA.php?peaCode=' + this.peaCode;
    this.http.get<trdata[]>(TraceURL).subscribe((resptr) => {
      this.dataSource.data = resptr as trdata[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  applyFilter(event: Event) {
    var filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  caltr2(peaTr){
    this.findtr(peaTr);
    this.caltr(peaTr);
  }
  caltr(peaTr) {
    loadModules([
      'esri/tasks/query',
      'esri/tasks/QueryTask',
      'esri/SpatialReference',
      'esri/geometry/Point',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/graphic',
      'esri/geometry/Multipoint',
      'esri/geometry/Polyline',
      'esri/symbols/TextSymbol',
      'esri/symbols/Font',
    ]).then(
      ([
        Query,
        QueryTask,
        SpatialReference,
        Point,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Color,
        Graphic,
        Multipoint,
        Polyline,
        TextSymbol,
        Font,
      ]) => {
        var query = new Query();
        var queryTask = new QueryTask(this.serviceUrlDynamic + '/17');
        //query.where = 'FACILITYID = \+"58-103161"+\'';
        query.where = "FACILITYID =  '" + peaTr + "'";
        //query.where = 'LOCATION LIKE \'%' + word +'%'+ '\'';
        query.returnGeometry = true;
        query.outFields = ['*'];
        //query.outFields = ['CODE','NAME','AREA_CODE'];
        queryTask.execute(query, (response: any) => {
          this.result = response.features;
          console.log(this.result);
          console.log(this.result[0].geometry.x);
          console.log(this.result[0].geometry.y);
          this.x = this.result[0].geometry.x;
          this.y = this.result[0].geometry.y;

          //Trace from Python Service
          //var TraceURL = "http://gisn2.pea.co.th/arcgis/rest/services/PEA/MapServer/exts/TraceDownHV_LV/TraceDownHV_LV?geometry=%7B%22x%22%3A"+this.x+"%2C%22y%22%3A"+this.y+"%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&f=pjson"
          var TraceURL =
            'http://n2-psim.pea.co.th:8000/opsaapi?pea_tr=' + peaTr;
          this.http.get(TraceURL).subscribe(
            (resp) => {
              console.log(resp);

              var ind = 0;
              var featureInd = {};

              (resp as any).traceResult.forEach((element) => {
                console.log(element.name);
                if (
                  element.name == 'DS_LowVoltageMeter:มิเตอร์แรงต่ำ 400/230V.'
                )
                  featureInd['meter'] = ind;
                else if (element.name == 'DS_Transformer:หม้อแปลงไฟฟ้า')
                  featureInd['transformer'] = ind;
                else if (element.name == 'DS_LVConductor:สายไฟแรงต่ำ 400/230V.')
                  featureInd['LVCon'] = ind;
                ind = ind + 1;
              });

              // Simple Line *****
              var line = new SimpleLineSymbol();
              line.setColor(new Color([0, 0, 0, 1]));

              //LVCon Symbol *****
              var markerLVABC = new SimpleLineSymbol().setWidth(3);
              markerLVABC.setColor(new Color([0, 0, 0, 1]));
              //const textLVABC = new TextSymbol("ABC").setColor(
              //new Color([128,0,0])).setAlign(Font.ALIGN_START).setAngle(45).setFont(
              //new Font("50pt").setWeight(Font.WEIGHT_BOLD)) ;
              //textLVABC.setColor(new Color([0, 0, 255, 1]));

              var markerLVA = new SimpleLineSymbol().setWidth(3);
              markerLVA.setColor(new Color([255, 0, 0, 1]));

              var markerLVB = new SimpleLineSymbol().setWidth(3);
              markerLVB.setColor(new Color([255, 255, 0, 1]));

              var markerLVC = new SimpleLineSymbol().setWidth(3);
              markerLVC.setColor(new Color([0, 0, 255, 1]));

              var markerLVAB = new SimpleLineSymbol().setWidth(3);
              markerLVAB.setColor(new Color([255, 165, 0, 1]));

              var markerLVCA = new SimpleLineSymbol().setWidth(3);
              markerLVCA.setColor(new Color([255, 0, 255, 1]));

              var markerLVBC = new SimpleLineSymbol().setWidth(3);
              markerLVBC.setColor(new Color([0, 255, 0, 1]));

              var markerLV0 = new SimpleLineSymbol().setWidth(3);
              markerLV0.setColor(new Color([206, 206, 206, 1]));

              //Meter Symbol *****
              var markerMT = new SimpleMarkerSymbol();
              markerMT.setStyle(SimpleMarkerSymbol.STYLE_CYCLE);
              markerMT.setColor(new Color([0, 255, 0, 0.75]));
              markerMT.setOutline(line);
              markerMT.setSize(15);

              var markerMT200 = new SimpleMarkerSymbol();
              markerMT200.setStyle(SimpleMarkerSymbol.STYLE_CYCLE);
              markerMT200.setColor(new Color([255, 0, 0, 0.75]));
              markerMT200.setOutline(line);
              markerMT200.setSize(15);

              //Transformer Symbol *****
              var markerTR = new SimpleMarkerSymbol();
              markerTR.setStyle(SimpleMarkerSymbol.STYLE_TRIANGLE);
              markerTR.setColor(new Color([162, 23, 162, 0.4]));
              markerTR.setOutline(line);
              markerTR.setSize(30);

              //Plot LVCon ******
              //var geoLVCon = [];
              //this.map.graphics.clear();
              (resp as any).traceResult[featureInd['LVCon']].features.forEach(
                (geo) => {
                  //console.log(geo);
                  if (geo.attributes.PHASEDESIGNATION == 7) {
                    //console.log(geo.attributes.PHASEDESIGNATION)
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVABC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 6) {
                    //console.log(geo.attributes.PHASEDESIGNATION)
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVAB);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 5) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVCA);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 3) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVBC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 4) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVA);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 2) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVB);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 1) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLV0);
                      this.map.graphics.add(graphicLV);
                    });
                  }
                }
              );

              //Plot Meter ******
              var geoMeter = [];
              var geoMeter200 = [];
              (resp as any).traceResult[featureInd['meter']].features.forEach(
                (geo) => {
                  //  console.log(geo);
                  if (geo.attributes.voltage >= 200) {
                    geoMeter.push([geo.geometry['x'], geo.geometry['y']]);
                  } else {
                    geoMeter200.push([geo.geometry['x'], geo.geometry['y']]);
                  }
                }
              );

              if (geoMeter.length > 0) {
                var mpMeter = new Multipoint(
                  new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                );
                console.log(geoMeter);
                mpMeter.points = geoMeter;
                var graphicMT = new Graphic(mpMeter, markerMT);
                this.map.graphics.add(graphicMT);
              }
              console.log('typeof meter', geoMeter.length);
              console.log(graphicMT);
              if (geoMeter200.length > 0) {
                console.log('======Plot Meter=======');
                var mpMeter200 = new Multipoint(
                  new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                );
                mpMeter200.points = geoMeter200;
                var graphicMT = new Graphic(mpMeter200, markerMT200);
                console.log('======Plot Meter2=======');
                this.map.graphics.add(graphicMT);
              }

              console.log('======Plot TR=======');
              console.log(this.x);
              console.log(this.y);
              var TRpoint1 = new Point(
                [this.x, this.y],
                new SpatialReference({ wkid: 102100, latestWkid: 3857 })
              );
              console.log(TRpoint1);
              console.log(this.x);
              console.log(this.y);
              console.log('======Plot Add TR=======');
              var graphicTR = new Graphic(TRpoint1, markerTR);

              this.map.centerAndZoom(TRpoint1, 12).then(() => {
                //this.map.graphics.clear();
                this.map.graphics.add(graphicTR);
              });
            },
            (error: any) => {
              alert('queryTask Error: ' + error);
            }
          );
        });
      }
    );
  }
  callseetr2(peaTr){
    this.findtr(peaTr);
    this.callseetr(peaTr);
  }
  callseetr(peaTr) {
    this.meter = [];
    var MTURL = "http://172.30.212.148/opsaservice/MTOPSA.php?peaTr=" + peaTr;
    this.http.get(MTURL).subscribe(
      (response) => {
        response['data'].forEach(element => {
          this.meter.push(element.peaMeter)

        });
        this.seetr(peaTr);
      });

    console.log(this.meter);

  }
  seetr(peaTr) {
    loadModules([
      'esri/tasks/query',
      'esri/tasks/QueryTask',
      'esri/SpatialReference',
      'esri/geometry/Point',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/graphic',
      'esri/geometry/Multipoint',
      'esri/geometry/Polyline',
      'esri/symbols/TextSymbol',
      'esri/symbols/Font',
    ]).then(
      ([
        Query,
        QueryTask,
        SpatialReference,
        Point,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Color,
        Graphic,
        Multipoint,
        Polyline,
        TextSymbol,
        Font,
      ]) => {
        var query = new Query();
        var queryTask = new QueryTask(this.serviceUrlDynamic + '/17');
        //query.where = 'FACILITYID = \+"58-103161"+\'';
        query.where = "FACILITYID =  '" + peaTr + "'";
        //query.where = 'LOCATION LIKE \'%' + word +'%'+ '\'';
        query.returnGeometry = true;
        query.outFields = ['*'];
        //query.outFields = ['CODE','NAME','AREA_CODE'];
        queryTask.execute(query, (response: any) => {
          this.result = response.features;
          console.log(this.result);
          console.log(this.result[0].geometry.x);
          console.log(this.result[0].geometry.y);
          this.x = this.result[0].geometry.x;
          this.y = this.result[0].geometry.y;
          var meter = [];
          //Trace from Python Service
          var TraceURL = "http://gisn2.pea.co.th/arcgis/rest/services/PEA/MapServer/exts/TraceDownHV_LV/TraceDownHV_LV?geometry=%7B%22x%22%3A" + this.x + "%2C%22y%22%3A" + this.y + "%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&f=pjson"
          //var TraceURL =
          //  'http://n2-psim.pea.co.th:8000/opsaapi?pea_tr=' + peaTr;


          this.http.get(TraceURL).subscribe(
            (resp) => {
              console.log(resp);

              var ind = 0;
              var featureInd = {};

              (resp as any).traceResult.forEach((element) => {
                console.log(element.name);
                if (
                  element.name == 'DS_LowVoltageMeter:มิเตอร์แรงต่ำ 400/230V.'
                )
                  featureInd['meter'] = ind;
                else if (element.name == 'DS_Transformer:หม้อแปลงไฟฟ้า')
                  featureInd['transformer'] = ind;
                else if (element.name == 'DS_LVConductor:สายไฟแรงต่ำ 400/230V.')
                  featureInd['LVCon'] = ind;
                ind = ind + 1;
              });

              // Simple Line *****
              var line = new SimpleLineSymbol();
              line.setColor(new Color([0, 0, 0, 1]));

              //LVCon Symbol *****
              var markerLVABC = new SimpleLineSymbol().setWidth(3);
              markerLVABC.setColor(new Color([0, 0, 0, 1]));
              //const textLVABC = new TextSymbol("ABC").setColor(
              //new Color([128,0,0])).setAlign(Font.ALIGN_START).setAngle(45).setFont(
              //new Font("50pt").setWeight(Font.WEIGHT_BOLD)) ;
              //textLVABC.setColor(new Color([0, 0, 255, 1]));

              var markerLVA = new SimpleLineSymbol().setWidth(3);
              markerLVA.setColor(new Color([255, 0, 0, 1]));

              var markerLVB = new SimpleLineSymbol().setWidth(3);
              markerLVB.setColor(new Color([255, 255, 0, 1]));

              var markerLVC = new SimpleLineSymbol().setWidth(3);
              markerLVC.setColor(new Color([0, 0, 255, 1]));

              var markerLVAB = new SimpleLineSymbol().setWidth(3);
              markerLVAB.setColor(new Color([255, 165, 0, 1]));

              var markerLVCA = new SimpleLineSymbol().setWidth(3);
              markerLVCA.setColor(new Color([255, 0, 255, 1]));

              var markerLVBC = new SimpleLineSymbol().setWidth(3);
              markerLVBC.setColor(new Color([0, 255, 0, 1]));

              var markerLV0 = new SimpleLineSymbol().setWidth(3);
              markerLV0.setColor(new Color([206, 206, 206, 1]));

              //Meter Symbol *****
              var markerMT = new SimpleMarkerSymbol();
              markerMT.setStyle(SimpleMarkerSymbol.STYLE_CYCLE);
              markerMT.setColor(new Color([0, 255, 0, 0.75]));
              markerMT.setOutline(line);
              markerMT.setSize(15);

              var markerMT200 = new SimpleMarkerSymbol();
              markerMT200.setStyle(SimpleMarkerSymbol.STYLE_CYCLE);
              markerMT200.setColor(new Color([255, 0, 0, 0.75]));
              markerMT200.setOutline(line);
              markerMT200.setSize(15);

              //Transformer Symbol *****
              var markerTR = new SimpleMarkerSymbol();
              markerTR.setStyle(SimpleMarkerSymbol.STYLE_TRIANGLE);
              markerTR.setColor(new Color([162, 23, 162, 0.4]));
              markerTR.setOutline(line);
              markerTR.setSize(30);

              //Plot LVCon ******
              //var geoLVCon = [];
              //this.map.graphics.clear();
              (resp as any).traceResult[featureInd['LVCon']].features.forEach(
                (geo) => {
                  //console.log(geo);
                  if (geo.attributes.PHASEDESIGNATION == 7) {
                    //console.log(geo.attributes.PHASEDESIGNATION)
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVABC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 6) {
                    //console.log(geo.attributes.PHASEDESIGNATION)
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVAB);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 5) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVCA);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 3) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVBC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 4) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVA);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 2) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVB);
                      this.map.graphics.add(graphicLV);
                    });
                  } else if (geo.attributes.PHASEDESIGNATION == 1) {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLVC);
                      this.map.graphics.add(graphicLV);
                    });
                  } else {
                    geo.geometry.paths.forEach((element) => {
                      //console.log(element)
                      var polylineJson = new Polyline(
                        new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                      );
                      polylineJson.addPath(element);
                      //console.log(polylineJson);
                      var graphicLV = new Graphic(polylineJson, markerLV0);
                      this.map.graphics.add(graphicLV);
                    });
                  }
                }
              );

              //Plot Meter ******
              //console.log(this.meter);
              var geoMeter = [];
              var geoMeter200 = [];
              (resp as any).traceResult[featureInd['meter']].features.forEach(
                (geo) => {
                  //  console.log(geo);
                  //if(this.meter.find(element => element = geo.attributes.PEANO)) {
                  //if (geo.attributes.PEANO >= 200) {
                  if (this.meter.includes(geo.attributes.PEANO)) {
                    geoMeter200.push([geo.geometry['x'], geo.geometry['y']]);
                  } else {
                    geoMeter.push([geo.geometry['x'], geo.geometry['y']]);
                  }
                }
              );

              if (geoMeter.length > 0) {
                var mpMeter = new Multipoint(
                  new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                );
                console.log(geoMeter);
                mpMeter.points = geoMeter;
                var graphicMT = new Graphic(mpMeter, markerMT);
                this.map.graphics.add(graphicMT);
              }
              console.log('typeof meter', geoMeter.length);
              console.log(graphicMT);
              if (geoMeter200.length > 0) {
                console.log('======Plot Meter=======');
                var mpMeter200 = new Multipoint(
                  new SpatialReference({ wkid: 102100, latestWkid: 3857 })
                );
                mpMeter200.points = geoMeter200;
                var graphicMT = new Graphic(mpMeter200, markerMT200);
                console.log('======Plot Meter2=======');
                this.map.graphics.add(graphicMT);
              }

              //Plot TR ******
              console.log('======Plot TR=======');
              console.log(this.x);
              console.log(this.y);
              var TRpoint1 = new Point(
                [this.x, this.y],
                new SpatialReference({ wkid: 102100, latestWkid: 3857 })
              );
              console.log(TRpoint1);
              console.log(this.x);
              console.log(this.y);
              console.log('======Plot Add TR=======');
              var graphicTR = new Graphic(TRpoint1, markerTR);

              this.map.centerAndZoom(TRpoint1, 12).then(() => {
                //this.map.graphics.clear();
                this.map.graphics.add(graphicTR);
              });
            },
            (error: any) => {
              alert('queryTask Error: ' + error);
            }
          );
        });
      }
    );
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    //console.log(this.data.error);
    this.dialogRef.close();
  }

}
