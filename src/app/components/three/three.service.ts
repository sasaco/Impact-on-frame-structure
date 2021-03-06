import { Injectable } from "@angular/core";
import { InputDataService } from "src/app/providers/input-data.service";
import { SceneService } from "./scene.service";
import * as THREE from "three";
import { DataHelperModule } from "src/app/providers/data-helper.module";
//import { DeclareFunctionStmt } from "@angular/compiler";

import { ThreeNodesService } from "./geometry/three-nodes.service";
import { ThreeMembersService } from "./geometry/three-members.service";
import { ThreeFixNodeService } from "./geometry/three-fix-node.service";
import { ThreeFixMemberService } from "./geometry/three-fix-member.service";
import { ThreeJointService } from "./geometry/three-joint.service";
import { ThreePanelService } from "./geometry/three-panel.service";
import { ThreeLoadService } from "./geometry/three-load/three-load.service";

import { ThreeDisplacementService } from "./geometry/three-displacement.service";
import { ThreeSectionForceService } from "./geometry/three-section-force/three-section-force.service";
import { ThreeReactService } from "./geometry/three-react.service";
import html2canvas from "html2canvas";
import { PrintService } from "../print/print.service";
import { PrintCustomThreeService } from "../print/custom/print-custom-three/print-custom-three.service";
import { ResultCombineFsecService } from "../result/result-combine-fsec/result-combine-fsec.service";
import { LoadService } from "./load.service";

@Injectable({
  providedIn: "root",
})
export class ThreeService {
  public mode: string;
  private currentIndex: number;
  public canvasElement: HTMLCanvasElement;

  public selectedNumber: number;

  public canvasWidth: string;
  public canvasHeight: string;

  public fileName: string;

  constructor(
    public scene: SceneService,
    private node: ThreeNodesService,
    private member: ThreeMembersService,
    private fixNode: ThreeFixNodeService,
    private fixMember: ThreeFixMemberService,
    private joint: ThreeJointService,
    private panel: ThreePanelService,
    private load: ThreeLoadService,
    private disg: ThreeDisplacementService,
    private reac: ThreeReactService,
    private fsec: ThreeSectionForceService,
    private helper: DataHelperModule,
    private printService: PrintService,
    private InputData: InputDataService,
    private secForce: ThreeSectionForceService,
    private customThree: PrintCustomThreeService,
    private resultFsec: ResultCombineFsecService,
    private load2: LoadService
  ) {}

  //////////////////////////////////////////////////////
  // ?????????
  public OnInit(): void {
    this.node.OnInit();
    this.member.OnInit();
    this.load2.onInit();
  }

  //////////////////////////////////////////////////////
  // ?????????????????????????????????
  public fileload(): void {
    // ??????????????????????????????
    this.node.changeData();
    this.member.changeData();
    // this.fixNode.ClearData();
    this.fixNode.changeData(1);
    this.fixMember.ClearData();
    this.joint.ClearData();
    this.panel.changeData();
    this.load.ResetData();
    this.disg.ClearData();
    this.reac.ClearData();
    this.fsec.ClearData();
    this.scene.render();
  }

  //////////////////////////////////////////////////////
  // ???????????????????????????????????????
  public changeData(mode: string = "", index: number = 0): void {
    switch (mode) {
      case "nodes":
        this.load.changeNode(this.node.changeData());
        this.member.changeData();
        break;

      case "members":
        this.load.changeMember(this.member.changeData());
        break;

      case "elements":
        // nothisng
        break;
      case "notice_points":
        // nothisng
        break;

      case "joints":
        this.joint.changeData(index);
        break;

      case "panel":
        this.panel.changeData(index);
        break;

      case "fix_nodes":
        this.fixNode.changeData(index);
        break;

      case "fix_member":
        this.fixMember.changeData(index);
        break;

      case "load_names":
        this.load.changeCase(index);
        break;

      case "load_values":
        this.load.changeData(index);
        break;

      default:
        // ???????????????
        return;
    }

    // ?????????
    this.scene.render();

    this.currentIndex = index;
  }

  //////////////////////////////////////////////////////
  // ?????????????????????????????????
  public selectChange(mode: string, index: number, index_sub: number): void {
    //console.log("selectChange", mode, index, index_sub);

    switch (mode) {
      case "nodes":
        this.node.selectChange(index);
        break;

      case "members":
        this.member.selectChange(index);
        break;

      case "elements":
        this.member.selectChange(index, mode);
        break;

      case "joints":
        this.joint.selectChange(index, index_sub);
        break;

      case "fix_nodes":
        this.fixNode.selectChange(index, index_sub);
        break;

      case "fix_member":
        this.fixMember.selectChange(index, index_sub);
        break;

      case "panel":
        this.panel.selectChange(index);
        break;

      case "load_names":
        this.load.selectChange(-1, index_sub); // ?????????????????????
        break;

      case "load_values":
        this.load.selectChange(index, index_sub);
        break;
    }
  }

  //////////////////////////////////////////////////////
  // ???????????????????????????
  public ClearData(): void {
    // ????????????????????????
    this.node.ClearData();
    this.member.ClearData();
    this.fixNode.ClearData();
    this.fixMember.ClearData();
    this.joint.ClearData();
    this.panel.ClearData();
    this.load.ClearData();
    this.disg.ClearData();
    this.reac.ClearData();
    this.fsec.ClearData();

    // ?????????
    this.scene.maxMinClear(); //max,min????????????
    this.scene.setNewHelper(100);
    this.scene.render();
  }

  //////////////////////////////////////////////////////
  // ?????????????????????????????????????????????
  public ChangePage(currentPage: number, option = {}): void {
    if (this.currentIndex === currentPage) {
      return;
    }

    switch (this.mode) {
      case "elements":
        break;

      case "joints":
        this.joint.changeData(currentPage);
        break;

      case "panel":
        this.panel.changeData(currentPage);
        break;

      case "fix_nodes":
        this.fixNode.changeData(currentPage);
        break;

      case "fix_member":
        this.fixMember.changeData(currentPage);
        break;

      case "load_names":
        if ("fixMemberPage" in option)
          this.fixMember.changeData(option["fixMemberPage"]);
        if ("fixNodePage" in option)
          this.fixNode.changeData(option["fixNodePage"]);
        this.load.changeCase(currentPage);
        break;

      case "load_values":
        this.load.changeCase(currentPage);
        break;

      case "disg":
        this.disg.changeData(currentPage);
      case "comb_disg":
      case "pik_disg":
        this.getMaxMinValue(
          this.disg.value_range,
          this.mode,
          currentPage,
          'momentY'
        );
        break;

      case "reac":
        this.reac.changeData(currentPage);
      case "comb_reac":
      case "pik_reac":
        this.getMaxMinValue(
          this.reac.value_range,
          this.mode,
          currentPage,
          'momentY'
        );
        break;

      case "fsec":
      case "comb_fsec":
      case "pik_fsec":
        this.fsec.changeData(currentPage, this.mode);
        let key: string;
        if (this.secForce.currentRadio === 'axialForce' ||
            this.secForce.currentRadio === 'torsionalMorment') {
          key = 'x';
        } else if ( this.secForce.currentRadio === 'shearForceY' ||
                    this.secForce.currentRadio === 'momentY') {
          key = 'y';
        } else if ( this.secForce.currentRadio === 'shearForceZ' ||
                    this.secForce.currentRadio === 'momentZ') {
          key = 'z';
        }
        this.getMaxMinValue(
          this.secForce.value_ranges,
          this.mode,
          currentPage,
          this.secForce.currentRadio,
          key
        );
        break;
    }
    this.currentIndex = currentPage;

    this.scene.getStatus(this.mode, this.currentIndex); // ?????????
    this.scene.render();
  }

  private getMaxMinValue(value_range, mode, currentPage, key1, key2=null): void {
    if(!(mode in value_range)){
      return
    }
    const a = value_range[mode];
    if(!(currentPage in a)){
      return
    }
    const b = a[currentPage];
    const c = key2==null ? b : b[key2];
    if(c === undefined){
      return
    }
    this.scene.getMaxMinValue(
      c,
      mode,
      key1
    );
  }
  //////////////////////////////////////////////////////
  // ?????????????????????????????????????????????
  public ChangeMode(ModeName: string): void {
    if (this.mode === ModeName) {
      return;
    }

    if (ModeName === "nodes") {
      this.node.visibleChange(true, true, true);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "members" || ModeName === "elements") {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, true);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "notice_points") {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "joints") {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(true);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "panel") {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "fix_nodes") {
      this.node.visibleChange(true, true, false);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(true);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "fix_member") {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(true);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    // ?????????
    if (ModeName === "load_names" || ModeName === "load_values") {
      // ???????????????????????????????????????
      this.load.reDrawNodeMember();

      if (ModeName === "load_names") {
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(true);
        this.fixMember.visibleChange(true);
        this.joint.visibleChange(true);
        this.panel.visibleChange(true, 0.3);
        this.load.visibleChange(true, true);
      }

      if (ModeName === "load_values") {
        this.node.visibleChange(true, true, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.panel.visibleChange(true, 0.3);
        this.load.visibleChange(true, true);
      }
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "disg") {
      this.node.visibleChange(true, true, false);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(true, 0.3);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(true);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "comb_disg" || ModeName === "pik_disg") {
      // ?????????????????????
      this.node.visibleChange(true, true, true);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(false);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (ModeName === "reac") {
      this.node.visibleChange(true, true, false);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(false);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(true);
      this.fsec.visibleChange("");
    }

    if (ModeName === "comb_reac" || ModeName === "pik_reac") {
      // ?????????????????????
      this.node.visibleChange(true, true, true);
      this.member.visibleChange(true, false, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(false);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange("");
    }

    if (
      ModeName === "fsec"
    ) {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(false);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange(ModeName);
      let key: string;
      if ( this.secForce.currentRadio === 'axialForce' ||
            this.secForce.currentRadio === 'torsionalMorment') {
        key = 'x';
      } else if ( this.secForce.currentRadio === 'shearForceY' ||
                  this.secForce.currentRadio === 'momentY') {
        key = 'y';
      } else if ( this.secForce.currentRadio === 'shearForceZ' ||
                  this.secForce.currentRadio === 'momentZ') {
        key = 'z';
      }
      this.getMaxMinValue(
        this.secForce.value_ranges,
        ModeName,
        '1',
        this.secForce.currentRadio,
        key
      );
    }

    if (
      ModeName === "comb_fsec" ||
      ModeName === "pik_fsec"
    ) {
      this.node.visibleChange(true, false, false);
      this.member.visibleChange(true, true, false);
      this.fixNode.visibleChange(false);
      this.fixMember.visibleChange(false);
      this.joint.visibleChange(false);
      this.panel.visibleChange(false);
      this.load.visibleChange(false, false);
      this.disg.visibleChange(false);
      this.reac.visibleChange(false);
      this.fsec.visibleChange(ModeName);
      let key: string;
      if ( this.secForce.currentRadio === 'axialForce' ||
            this.secForce.currentRadio === 'torsionalMorment') {
        key = 'x';
      } else if ( this.secForce.currentRadio === 'shearForceY' ||
                  this.secForce.currentRadio === 'momentY') {
        key = 'y';
      } else if ( this.secForce.currentRadio === 'shearForceZ' ||
                  this.secForce.currentRadio === 'momentZ') {
        key = 'z';
      }
      this.getMaxMinValue(
        this.secForce.value_ranges,
        ModeName,
        '1',
        this.secForce.currentRadio,
        key
      );
    }

    this.mode = ModeName;
    this.currentIndex = -1;

    document.getElementById("max-min").style.display = "none";
    this.scene.getStatus(this.mode, this.currentIndex); // ?????????
    // ?????????
    this.scene.render();
  }

  //////////////////////////////////////////////////////
  // ??????????????????????????????????????????????????????????????????
  public detectObject(mouse: THREE.Vector2, action: string): void {
    const raycaster = this.scene.getRaycaster(mouse);
    this.load2.detectObject(raycaster, action);
    return;

    switch (this.mode) {
      case "nodes": // ????????????????????????
        this.node.detectObject(raycaster, action);
        break;

      case "fix_nodes":
        this.fixNode.detectObject(raycaster, action);
        break;

      case "joints":
        this.joint.detectObject(raycaster, action);
        break;

      case "members":
      case "elements":
        this.member.detectObject(raycaster, action);
        break;

      case "panel":
        this.panel.detectObject(raycaster, action);
        break;

      case "fix_member":
        this.member.detectObject(raycaster, action);
        break;

      case "load_values":
        this.load.detectObject(raycaster, action);
        // this.member.detectObject(raycaster, action);
        break;

      case "load_names":
        break;

      case "disg":
      case "comb_disg":
      case "pik_disg":
        break;

      case "fsec":
      case "comb_fsec":
      case "pik_fsec":
        break;

      case "reac":
      case "comb_reac":
      case "pik_reac":
        break;
    }
    // ?????????
    //this.scene.render();
  }

  // ??????????????????????????????
  public async getCaptureImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      const result = [];
      const captureInfo = this.getCaptureCase();
      const captureCase: string[] = captureInfo.captureCase;

      const title1: string = captureInfo.title1;
      const title2: string = captureInfo.title2;
      const title3: string[] = captureInfo.title3;
      const screenArea = document.getElementById("screenArea");
      screenArea.style.width = this.canvasWidth;
      screenArea.style.height = this.canvasHeight;

      if (captureCase.length === 0) {
        html2canvas(screenArea).then((canvas) => {
          result.push({
            title: title2,
            src: canvas.toDataURL(),
          });
          resolve({ result, title1 });
        });
      } else if (
        this.mode === "fsec" ||
        this.mode === "comb_fsec" ||
        this.mode === "pik_fsec"
      ) {
        let counter = 0;
        const title4: string[] = captureInfo.title4;
        const title5: string[] = captureInfo.title5;
        for (let i = 0; i < captureCase.length; i++) {
          this.selectedNumber = 0;
          for (let j = 0; j < this.customThree.threeEditable.length; j++) {
            if (this.customThree.threeEditable[j] === true) {
              this.selectedNumber += 1;
              const key = captureCase[i];
              // const captureFescTypeName: string[] = ;
              const loadType = title4[j];
              const loadTypeJa = title5[j];
              const number: number = this.helper.toNumber(key);
              if (number === null) {
                continue;
              }

              // title3 ??? ??????????????????????????????
              let name = key;
              if (title3.length > i) {
                name = title3[i];
              }
              this.ChangePage(number);

              // this.ChangePage(number,this.mode).finally(() => {
              this.secForce.changeRadioButtons(loadType);
              html2canvas(screenArea).then((canvas) => {
                result.push({
                  title: title2 + name,
                  type: loadTypeJa,
                  src: canvas.toDataURL(),
                });
                counter++;

                if (counter === captureCase.length * this.selectedNumber) {
                  resolve({ result, title1 });
                }
              });
              // });
            }
          }
        }
      } else {
        let counter = 0;
        this.currentIndex = -1; // this.ChangePage????????????????????????????????????this.currentIndex?????????
        for (let i = 0; i < captureCase.length; i++) {
          const key = captureCase[i];

          const number: number = this.helper.toNumber(key);
          if (number === null) {
            continue;
          }

          // .finally(() => {
          // title3 ??? ??????????????????????????????
          let name = key;
          if (title3.length > i) {
            name = title3[i];
          }

          this.ChangePage(number);

          html2canvas(screenArea).then((canvas) => {
            result.push({
              title: title2 + name,
              src: canvas.toDataURL(),
            });
            counter++;

            if (counter === captureCase.length) {
              resolve({ result, title1 });
            }
          });
          // });
        }
      }
    });
  }
  // ?????????????????????????????????
  private getCaptureCase(): any {
    let result: string[] = new Array();
    let title1: string = "";
    let title2: string = "";
    let title3: string[] = new Array();
    let title4: string[] = new Array();
    let title5: string[] = new Array();
    let title6: string[] = new Array();

    this.printService.setprintDocument();

    switch (this.mode) {
      case "fix_member":
        if ("fix_member" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.fix_member);
        }
        title1 = "????????????";
        title2 = "TYPE";
        break;

      case "fix_nodes":
        if ("fix_node" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.fix_node);
        }
        title1 = "??????";
        title2 = "TYPE";
        break;

      case "joints":
        if ("joint" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.joint);
        }
        title1 = "??????";
        title2 = "TYPE";
        break;

      case "load_values":
      case "load_names":
        if ("load" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.load);
          title3 = this.getLoadTitle();
        }
        title1 = "??????";
        title2 = "Case";
        break;
      case "disg":
        if ("load" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.load);
          title3 = this.getLoadTitle();
        }
        title1 = "??????";
        title2 = "Case";
        break;
      case "fsec":
        if ("load" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.load);
          title3 = this.getLoadTitle();
        }
        title1 = "?????????";
        title2 = "Case";
        title4 = this.printService.fescIndex;
        title5 = this.printService.fescIndexJa;
        break;
      case "reac":
        if ("load" in this.printService.inputJson) {
          result = Object.keys(this.printService.inputJson.load);
          title3 = this.getLoadTitle();
        }
        title1 = "??????";
        title2 = "Case";
        break;

      case "comb_disg":
        result = Object.keys(this.printService.combineJson);
        title1 = "??????????????? ?????????";
        title2 = "Comb";
        title3 = this.getCombTitle();
        break;
      case "comb_fsec":
        result = Object.keys(this.printService.combineJson);
        title1 = "??????????????? ?????????";
        title2 = "Comb";
        title3 = this.getCombTitle();
        title4 = this.printService.fescIndex;
        title5 = this.printService.fescIndexJa;
        break;
      case "comb_reac":
        result = Object.keys(this.printService.combineJson);
        title1 = "??????????????? ??????";
        title2 = "Comb";
        title3 = this.getCombTitle();
        break;

      case "pik_disg":
        result = Object.keys(this.printService.pickupJson);
        title1 = "?????????????????? ?????????";
        title2 = "PickUp";
        title3 = this.getPickupTitle();
        break;
      case "pik_fsec":
        result = Object.keys(this.printService.pickupJson);
        title1 = "?????????????????? ?????????";
        title2 = "PickUp";
        title3 = this.getPickupTitle();
        title4 = this.printService.fescIndex;
        title5 = this.printService.fescIndexJa;
        break;
      case "pik_reac":
        result = Object.keys(this.printService.pickupJson);
        title1 = "?????????????????? ??????";
        title2 = "PickUp";
        title3 = this.getPickupTitle();
        break;

      case "nodes": // ?????? 1??????????????????
      case "members":
      case "elements":
      case "panel":
      default:
        break;
    }
    return {
      title1,
      title2,
      title3,
      title4,
      title5,
      captureCase: result,
    };
  }

  private getLoadTitle(): string[] {
    const title3: string[] = new Array();

    const load = this.printService.inputJson.load;
    for (const key of Object.keys(load)) {
      const current = load[key];
      let str: string = key;
      if (current.symbol.trim().length > 0) str += " " + current.symbol;
      if (current.name.trim().length > 0) str += " " + current.name;
      title3.push(str);
    }
    return title3;
  }

  private getCombTitle(): string[] {
    const title3: string[] = new Array();

    const comb = this.InputData.combine.getCombineJson();
    for (const key of Object.keys(this.printService.combineJson)) {
      const current = comb[key];
      let str: string = key;
      if (current.name in current) {
        str += current.name.trim().length > 0 ? " " + current.name : "";
      } else {
        str += "";
      }
      title3.push(str);
    }
    return title3;
  }

  private getPickupTitle(): string[] {
    const title3: string[] = new Array();

    const pik = this.InputData.pickup.getPickUpJson();
    for (const key of Object.keys(this.printService.pickupJson)) {
      const current = pik[key];
      let str: string = key;
      if (current.name in current) {
        str += current.name.trim().length > 0 ? " " + current.name : "";
      } else {
        str += "";
      }
      title3.push(str);
    }
    return title3;
  }
}
