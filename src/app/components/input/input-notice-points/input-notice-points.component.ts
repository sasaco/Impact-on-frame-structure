import { Component, OnInit, ViewChild } from "@angular/core";
import { InputMembersService } from "../input-members/input-members.service";
import { InputNoticePointsService } from "./input-notice-points.service";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { ThreeService } from "../../three/three.service";
import { SheetComponent } from "../sheet/sheet.component";
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-input-notice-points",
  templateUrl: "./input-notice-points.component.html",
  styleUrls: [
    "./input-notice-points.component.scss",
    "../../../app.component.scss",
  ],
})
export class InputNoticePointsComponent implements OnInit {
  @ViewChild("grid") grid: SheetComponent;

  private dataset = [];
  private columnHeaders: any = [
    {
      title: this.translate.instant("input.input-notice-points.memberNo"),
      dataType: "string",
      dataIndx: "m",
      sortable: false,
      minwidth: 10,
      width: 10,
    },
    {
      title: this.translate.instant("input.input-notice-points.distance"),
      dataType: "float",
      format: "#.000",
      dataIndx: "len",
      sortable: false,
      width: 80,
      editable: false,
      style: { background: "#dae6f0" },
    },
    { 
      title: this.translate.instant("input.input-notice-points.distance_from_node_i"),
      colModel: [] },
  ];

  private ROWS_COUNT = 15;

  constructor(
    private data: InputNoticePointsService,
    private member: InputMembersService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService,
    private translate: TranslateService
  ) {
    for (let i = 1; i <= this.data.NOTICE_POINTS_COUNT; i++) {
      const id = "L" + i;
      this.columnHeaders[2].colModel.push({
        title: id,
        dataType: "float",
        format: "#.000",
        dataIndx: id,
        sortable: false,
        width: 80,
      });
    }
  }

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js ????????????????????????????????????
    this.three.ChangeMode("notice_points");
  }

  // ?????????row ?????????????????????????????????
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const notice_points = this.data.getNoticePointsColumns(i);
      const m: string = notice_points["m"];
      if (m !== "") {
        const l: number = this.member.getMemberLength(m);
        notice_points["len"] = l != null ? l.toFixed(3) : "";
      }
      this.dataset.push(notice_points);
    }
  }

  // ???????????????????????????
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight();
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
    scrollModel: {
      horizontal: true,
    },
    locale: "jp",
    height: this.tableHeight(),
    numberCell: {
      show: false, // ?????????
    },
    colModel: this.columnHeaders,
    dataModel: {
      data: this.dataset,
    },
    beforeTableView: (evt, ui) => {
      const finalV = ui.finalV;
      const dataV = this.dataset.length;
      if (ui.initV == null) {
        return;
      }
      if (finalV >= dataV - 1) {
        this.loadData(dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange("notice-points", row, column);
    },
    change: (evt, ui) => {
      const changes = ui.updateList;
      for (const target of changes) {
        const row: number = target.rowIndx;
        if (!("m" in target.newRow)) {
          continue;
        }
        const m: string = target.newRow["m"];
        if (m === void 0) {
          this.dataset[row]["m"] = "";
          this.dataset[row]["len"] = "";
        } else {
          const l: number = this.member.getMemberLength(m);
          this.dataset[row]["len"] = l != null ? l : null;
        }
        this.grid.refreshDataAndView();
      }
      // copy&paste????????????????????????????????????????????????????????????addList?????????????????????.
      for (const target of ui.addList) {
        const no: number = target.rowIndx;
        const notice_points = this.data.getNoticePointsColumns(no + 1);
        const newRow = target.newRow;
        notice_points['m'] = (newRow.m != undefined) ? newRow.m : '';
        for (let num = 1; num <= this.data.NOTICE_POINTS_COUNT; num++) {
          const key = "L" + num.toString();
          notice_points[key] = (newRow[key] != undefined && key in newRow) ? newRow[key] : '';
        }
        // ?????????????????????????????????. 
        if (newRow.m !== '') {
          const l: number = this.member.getMemberLength(newRow.m);
          notice_points['len'] = (l == null) ? null : l.toFixed(3);
        }
        this.dataset.splice(no, 1, notice_points);
      }
      this.three.changeData("notice-points");
    },
  };
}
