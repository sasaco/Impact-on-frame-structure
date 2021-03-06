import { Component, OnInit, ViewChild } from "@angular/core";
import { InputFixNodeService } from "./input-fix-node.service";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { ThreeService } from "../../three/three.service";
import { SheetComponent } from "../sheet/sheet.component";
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-input-fix-node",
  templateUrl: "./input-fix-node.component.html",
  styleUrls: ["./input-fix-node.component.scss", "../../../app.component.scss"],
})
export class InputFixNodeComponent implements OnInit {
  @ViewChild("grid") grid: SheetComponent;

  private ROWS_COUNT = 15;
  private page = 1;
  private dataset = [];

  private columnHeaders3D = [
    {
      title: this.translate.instant("input.input-fix-node.node"),
      align: "center",
      colModel: [
        {
          title: "No",
          align: "center",
          dataType: "string",
          dataIndx: "n",
          sortable: false,
          width: 30,
        },
      ],
    },
    {
      title: this.translate.instant(
        "input.input-fix-node.displacementRestraint"
      ),
      align: "center",
      colModel: [
        {
          title: this.translate.instant("input.input-fix-node.x_direction"),
          dataType: "float",
          dataIndx: "tx",
          sortable: false,
          width: 100,
        },
        {
          title: this.translate.instant("input.input-fix-node.y_direction"),
          dataType: "float",
          dataIndx: "ty",
          sortable: false,
          width: 100,
        },
        {
          title: this.translate.instant("input.input-fix-node.z_direction"),
          dataType: "float",
          dataIndx: "tz",
          sortable: false,
          width: 100,
        },
      ],
    },
    {
      title: this.translate.instant("input.input-fix-node.rotationalRestraint"),
      align: "center",
      colModel: [
        {
          title: this.translate.instant("input.input-fix-node.x_around"),
          dataType: "float",
          dataIndx: "rx",
          sortable: false,
          width: 100,
        },
        {
          title: this.translate.instant("input.input-fix-node.y_around"),
          dataType: "float",
          dataIndx: "ry",
          sortable: false,
          width: 100,
        },
        {
          title: this.translate.instant("input.input-fix-node.z_around"),
          dataType: "float",
          dataIndx: "rz",
          sortable: false,
          width: 100,
        },
      ],
    },
  ];
  private columnHeaders2D = [
    {
      title: this.translate.instant("input.input-fix-node.node"),
      align: "center",
      colModel: [
        {
          title: "No",
          align: "center",
          dataType: "string",
          dataIndx: "n",
          sortable: false,
          width: 30,
        },
      ],
    },
    {
      title: this.translate.instant(
        "input.input-fix-node.displacementRestraint"
      ),
      align: "center",
      colModel: [
        {
          title: this.translate.instant("input.input-fix-node.x_direction"),
          dataType: "float",
          dataIndx: "tx",
          sortable: false,
          width: 100,
        },
        {
          title: this.translate.instant("input.input-fix-node.y_direction"),
          dataType: "float",
          dataIndx: "ty",
          sortable: false,
          width: 100,
        },
      ],
    },
    {
      title: this.translate.instant("input.input-fix-node.rotationalRestraint"),
      align: "center",
      colModel: [
        {
          title: " (kN???m/rad)",
          dataType: "float",
          dataIndx: "rz",
          sortable: false,
          width: 100,
        },
      ],
    },
  ];

  constructor(
    private data: InputFixNodeService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    this.loadPage(1, this.ROWS_COUNT);
    this.three.ChangeMode("fix_nodes");
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
      const fix_node = this.data.getFixNodeColumns(currentPage, i);
      this.dataset.push(fix_node);
    }
    this.page = currentPage;
  }

  // ???????????????????????????
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight() - 70; // pager???????????????
    return containerHeight.toString();
  }
  // ?????????????????????????????????????????????
  private rowsCount(): number {
    const containerHeight = this.app.getDialogHeight();
    return Math.round(containerHeight / 30);
  }

  private colModel(): any {
    this.helper.dimension === 3 ? this.columnHeaders3D : this.columnHeaders2D;
  }

  // ?????????????????????
  options: pq.gridT.options = {
    showTop: false,
    reactive: true,
    sortable: false,
    locale: "jp",
    height: this.tableHeight(),
    numberCell: {
      show: false, // ?????????
    },
    colModel:
      this.helper.dimension === 3 ? this.columnHeaders3D : this.columnHeaders2D,
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
        this.loadPage(this.page, dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange("fix_nodes", row, column);
    },
    change: (evt, ui) => {
      // copy&paste????????????????????????????????????????????????????????????addList?????????????????????.
      for (const target of ui.addList) {
        const no: number = target.rowIndx;
        const node = this.data.getFixNodeColumns(this.page, no + 1);
        node["n"] = target.newRow.n != undefined ? target.newRow.n : "";
        node["tx"] = target.newRow.tx != undefined ? target.newRow.tx : "";
        node["ty"] = target.newRow.ty != undefined ? target.newRow.ty : "";
        node["tz"] = target.newRow.tz != undefined ? target.newRow.tz : "";
        node["rx"] = target.newRow.rx != undefined ? target.newRow.rx : "";
        node["ry"] = target.newRow.ry != undefined ? target.newRow.ry : "";
        node["rz"] = target.newRow.rz != undefined ? target.newRow.rz : "";
        this.dataset.splice(no, 1, node);
      }
      this.three.changeData("fix_nodes", this.page);
    },
  };

  width = this.helper.dimension === 3 ? 712 : 412;
}
