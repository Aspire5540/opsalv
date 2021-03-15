import { Component, OnInit, ViewChild } from '@angular/core';

import { ConfigService } from '../config/config.service';
import {Chart} from 'chart.js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  myDonut: Chart;
  myBar: Chart;
  option = "1";
  totalTr=0



  unit = ' kVA';
  peaname = {};
  peaname2 = [];
  selBudjet = ['', ''];
  selPea = '';
  selPeaName = 'กฟน.2';
  selPeapeaCode = '';
  selPeapeaCode2 = 'B000';
  currentMatherPea = "";
  currentPea = "";
  peaCode = "";
  peaNum: string;
  roicp = {};
  kvaPlnTotal = 0;
  kvaTotal = 0;
  kvaD1Total = 0;
  workCostActTRTotal: number;
  workCostActBYTotal: number;
  workCostActTotal: number;
  workCostPlnTotal: number;
  matCostActTotal: number;
  matCostPlnTotal: number;
  roicdate: string;
  car: string;


  constructor(private configService: ConfigService) {
    // this.getpeaList();
    // this.getpeaList2();

    
  }

  ngOnInit() {


    // this.peaCode = localStorage.getItem('peaCode');
    // this.peaCode = 'B00000';
    // this.peaNum = this.peaCode.substr(1, 5);
    // this.selPeapeaCode = this.peaCode.substr(0, 4);

    // this.getinfo();
    //this.getJobClsdPea();


  }
  getinfo() {
    this.configService.postdata2('roic/rdInfo.php', { data: 'roicdate' }).subscribe((data => {
      if (data['status'] == 1) {
        this.roicdate = data['data'][0].info;
        //--------------------------------
        //this.roicdate="31 พ.ค. 2563";
      } else {
        alert(data['data']);
      }

    }));

  }


  callData() {
    this.getTrData();
    //this.getTrPea();
    //this.getBudgetPea();

  }
  getpeaList() {
    this.configService.postdata2('/rdpeaall.php', {}).subscribe((data => {
      console.log(data);

      if (data["status"] == 1) {
        data["data"].forEach(element => {
          this.peaname[element.peaCode] = element.peaName;

        });
        this.callData();
        this.currentPea = this.peaname[this.peaCode.substring(0, 6)];
        if (this.peaCode == "B00000") {
          this.currentMatherPea = this.peaname[this.peaCode.substring(0, 6)];
        } else {
          this.currentMatherPea = this.peaname[this.peaCode.substring(0, 4)];
        }

      } else {
        alert(data["data"]);
      }

    }))


  }
  getpeaList2() {
    this.configService.postdata2('/rdpeaall2.php', {}).subscribe((data => {
      if (data['status'] == 1) {
        //console.log(data['data']);
        this.peaname2 = data['data'];
        //console.log(this.peaname);
      } else {
        alert(data['data']);
      }

    }))

  }
  selectPea(event) {
    this.selPea = event.value[0];
    this.selPeaName = event.value[2];
    this.selPeapeaCode = event.value[1];
    this.currentMatherPea = this.peaname[this.selPeapeaCode];

    this.getTrData();

  }
  selectPea2(event) {
    this.selPeapeaCode2 = event.value[1];

    //this.getTrPea();
  }
  getTrData() {
    //จำนวนงานคงค้าง %เบิกจ่าย
    //this.getRoicP();
    this.configService.postdata2('/rdLoad.php', { peaCode: this.selPeapeaCode, option: this.option }).subscribe((data => {
      if (data['status'] == 1) {
        var Pea = [];
        var PeaPln='';
        var Trcnt=0;
        var TrPlnList={};
        var TrCntList =[];
        this.totalTr=0;
        var TrN2


        this.unit = ' เครื่อง';

        data['dataP'].forEach(element => {
          Trcnt = Trcnt + Number(element.totalTr);
        });
        //console.log(TrPlnList);
        data['data'].forEach(element => {
          Pea.push(this.peaname["B" + element.Pea]);
          TrCntList.push(element.totalTr);
          this.totalTr = this.totalTr + Number(element.totalTr);
        });
        if(this.selPeapeaCode=='B000'){
          TrN2=23015;
        }else{
          TrN2=Trcnt;
        }
        

        if (this.myDonut) this.myDonut.destroy();
        var pcentTr=this.totalTr/TrN2*100
        this.myDonut = new Chart('myDonut', {
          type: 'doughnut',
          data:  {
            datasets: [{
              data: [pcentTr.toFixed(2),(100-this.totalTr/TrN2*100).toFixed(2)
              ],
              backgroundColor: [
                "#FFC300","#a68fe8",
              ],
            }],
            labels: [
              ' โหลดเกิน 80% : '+ [pcentTr.toFixed(2)]+' %',
              ' '+[(100-this.totalTr/23015*100).toFixed(2)]+' %',]
          },plugins: [{
            beforeDraw: function(chart) {
              var width = chart.chart.width,
                  height = chart.chart.height,
                  ctx = chart.chart.ctx;
                  //text =chart.config.data.dataset[0].data[0];
              
              ctx.restore();
              var fontSize = (height / 120).toFixed(2);
              ctx.font = fontSize + "em sans-serif";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#FFFEFF";
              var text = chart.config.data.datasets[0].data[0]+"%",
                  textX = Math.round((width - ctx.measureText(text).width) / 2),
                  textY = height / 2;
          
              ctx.fillText(text, textX, textY);
              ctx.save();
            }
        }],
        options: {
          // Elements options apply to all of the options unless overridden in a dataset
          // In this case, we are setting the border of each horizontal bar to be 2px wide
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItems, data) {
                return data.labels[tooltipItems.index];
              }
            }
          },
          elements: {
            rectangle: {
              borderWidth: 2,
            }
          },
          responsive: false,
          legend: {
            position: 'bottom',
            display: false,
          
          },
          title: {
            display: false,
            text: "tst"
          }
        } 
      });


      //bar
      var barChartData = {
        labels: Pea,
        datasets: [{
          label: 'หม้อแปลง',
          backgroundColor: [
            "#fe68af","#a92137","#44a0a5","#5593ed","#c93346","#627e48","#f958e4","#d43fbd","#7273be","#179cd5","#3074d7","#44a0a5"
          ],
          borderWidth: 1,
          data: TrCntList
        }]
  
      };
      if (this.myBar) this.myBar.destroy();
      var pcentTr=this.totalTr/23015*100
      this.myBar = new Chart('myBar', {
				type: 'bar',
				data: barChartData,
        options: {
          
          scales: {
            yAxes: [{
                  ticks:{
                    beginAtZero :true
                  }
                }]
              },

            
					indexAxis: 'y',
					// Elements options apply to all of the options unless overridden in a dataset
					// In this case, we are setting the border of each horizontal bar to be 2px wide
					elements: {
						rectangle: {
							borderWidth: 2,
						}
					},
					responsive: true,
					legend: {
						position: 'right',
					},
					title: {
						display: true,
					}
        }
      }
      )
  

      } else {
        alert(data['data']);
      }

    }));
    

  }

  onValChange(val) {
    this.option = val;
    this.getTrData();

  }
  selectBudget(event) {
    this.selBudjet = event.value;

    //this.getJobClsdPea();
    this.getTrData();
  }

}

