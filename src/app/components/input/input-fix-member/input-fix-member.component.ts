import { Component, OnInit, ViewChild } from "@angular/core";
import { InputFixMemberService } from './input-fix-member.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from 'src/app/app.component';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss','../../../app.component.scss']
})
export class InputFixMemberComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders3D =[
    { 
      title: this.translate.instant("input.input-fix-member.member"),
      align: 'center', colModel: [
      { 
        title: "No", align: 'center',   dataType: "string", dataIndx: "m",  sortable: false, width: 30 },
    ]},
    { 
      title: this.translate.instant("input.input-fix-member.displacementRestraint"),

      align: 'center', colModel: [
      { 
        title: this.translate.instant("input.input-fix-member.v_axis"),
        dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
      { 
        title: this.translate.instant("input.input-fix-member.y_axis"),
        dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
      { 
        title: this.translate.instant("input.input-fix-member.z_axis"),
        dataType: "float",   dataIndx: "tz", sortable: false, width: 100 },
    ]},
    { 
      title: this.translate.instant("input.input-fix-member.rotationalRestraint"),
      align: 'center', colModel: [
      { 
        title: "(kNm/rad/m)",  dataType: "float",   dataIndx: "tr", sortable: false, width: 100 }
    ]},
  ];
  private columnHeaders2D =[
    { 
      title: this.translate.instant("input.input-fix-member.member"),
      align: 'center', colModel: [
      { title: "No", align: 'center',   dataType: "string", dataIndx: "m",  sortable: false, width: 30 },
    ]},
    { 
      title: this.translate.instant("input.input-fix-member.v_axis"),
      align: 'center', colModel: [
      { title: "(kN/m/m)", dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
    ]},
    { 
      title: this.translate.instant("input.input-fix-member.r_axis"),
      align: 'center', colModel: [
      { title: "(kN/m/m)", dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
    ]},
];

  private ROWS_COUNT = 15;
  private page = 1;

  constructor(
    private data: InputFixMemberService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService,
    private translate: TranslateService
  ) {}


    ngOnInit() {
      this.ROWS_COUNT = this.rowsCount();
      this.loadPage(1, this.ROWS_COUNT);
      this.three.ChangeMode("fix_member");
      this.three.ChangePage(1);
    }

    //???pager.component ??????????????????????????????
    onReceiveEventFromChild(eventData: number) {
      this.dataset.splice(0);
      this.loadPage(eventData, this.ROWS_COUNT);
      this.grid.refreshDataAndView();
      this.three.ChangePage(eventData);
    }

  //
  loadPage(currentPage: number, row: number) {

    for (let i = this.dataset.length + 1; i <= row; i++) {
      const fix_node = this.data.getFixMemberColumns(currentPage, i);
      this.dataset.push(fix_node);
    }


    this.page = currentPage;
  }


  // ???????????????????????????
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight() - 70;// pager???????????????
    return containerHeight.toString();
  }
  // ?????????????????????????????????????????????
  private rowsCount(): number {
    const containerHeight = this.app.getDialogHeight();
    return Math.round(containerHeight / 30);
  }

  // ?????????????????????
  options: pq.gridT.options = {
    showTop: false,
    reactive: true,
    sortable: false,
    locale: "jp",
    height: this.tableHeight(),
    numberCell: {
      show: false // ?????????
    },
    colModel: (this.helper.dimension === 3) ? this.columnHeaders3D : this.columnHeaders2D,
    dataModel: {
      data: this.dataset
    },
    beforeTableView: (evt, ui) => {
      const finalV = ui.finalV;
      const dataV = this.dataset.length;
      if (ui.initV == null) {
          return;
      }
      if (finalV >= dataV - 1) {
        this.loadPage(this.page, dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange('fix_member', row, column);
    },
    change: (evt, ui) => {
      // copy&paste????????????????????????????????????????????????????????????addList?????????????????????.
      for (const target of ui.addList) {
        const no: number = target.rowIndx;
        const newRow = target.newRow;
        const fixmember = this.data.getFixMemberColumns(this.page, no + 1);
        fixmember['m']  = (newRow.m  != undefined) ? newRow.m  : '';
        fixmember['tx'] = (newRow.tx != undefined) ? newRow.tx : '';
        fixmember['ty'] = (newRow.ty != undefined) ? newRow.ty : '';
        fixmember['tz'] = (newRow.tz != undefined) ? newRow.tz : '';
        fixmember['tr'] = (newRow.tr != undefined) ? newRow.tr : '';
        this.dataset.splice(no, 1, fixmember)
      }
      this.three.changeData('fix_member', this.page);
    }
  };

  width = (this.helper.dimension === 3) ? 510 : 410 ;

}
