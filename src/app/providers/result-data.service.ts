import { Injectable } from "@angular/core";

import { InputCombineService } from "../components/input/input-combine/input-combine.service";
import { InputDefineService } from "../components/input/input-define/input-define.service";
import { InputLoadService } from "../components/input/input-load/input-load.service";
import { InputPickupService } from "../components/input/input-pickup/input-pickup.service";

import { ResultDisgService } from "../components/result/result-disg/result-disg.service";
import { ResultReacService } from "../components/result/result-reac/result-reac.service";
import { ResultFsecService } from "../components/result/result-fsec/result-fsec.service";
import { ResultCombineDisgService } from "../components/result/result-combine-disg/result-combine-disg.service";
import { ResultCombineReacService } from "../components/result/result-combine-reac/result-combine-reac.service";
import { ResultCombineFsecService } from "../components/result/result-combine-fsec/result-combine-fsec.service";
import { ResultPickupDisgService } from "../components/result/result-pickup-disg/result-pickup-disg.service";
import { ResultPickupReacService } from "../components/result/result-pickup-reac/result-pickup-reac.service";
import { ResultPickupFsecService } from "../components/result/result-pickup-fsec/result-pickup-fsec.service";

import { ThreeSectionForceService } from "../components/three/geometry/three-section-force/three-section-force.service";
import { ThreeReactService } from "../components/three/geometry/three-react.service";
import { ThreeDisplacementService } from "../components/three/geometry/three-displacement.service";

import { DataHelperModule } from "./data-helper.module";
import { InputDataService } from "./input-data.service";

@Injectable({
  providedIn: "root",
})
export class ResultDataService {
  public isCalculated: boolean;

  private defList: any = null;
  private combList: any = null;
  private pickList: any = null;

  constructor(
    private InputData: InputDataService,
    private combine: InputCombineService,
    private define: InputDefineService,
    private load: InputLoadService,
    private pickup: InputPickupService,

    public disg: ResultDisgService,
    public reac: ResultReacService,
    public fsec: ResultFsecService,
    public combdisg: ResultCombineDisgService,
    public combreac: ResultCombineReacService,
    public combfsec: ResultCombineFsecService,
    public pickdisg: ResultPickupDisgService,
    public pickreac: ResultPickupReacService,
    public pickfsec: ResultPickupFsecService,

    private three_fsec: ThreeSectionForceService,
    private three_reac: ThreeReactService,
    private three_disg: ThreeDisplacementService,

    private helper: DataHelperModule
  ) {
    this.clear();
  }

  // ??????????????????????????? ///////////////////////////////////////////////////////////////
  public clear(): void {
    this.isCalculated = false;

    this.disg.clear();
    this.reac.clear();
    this.fsec.clear();
    this.combdisg.clear();
    this.combreac.clear();
    this.combfsec.clear();
    this.pickdisg.clear();
    this.pickreac.clear();
    this.pickfsec.clear();

    // ?????????????????????
    this.three_fsec.ClearData();
    this.three_reac.ClearData();
    this.three_disg.ClearData();
  }

  // ???????????????????????????
  public loadResultData(jsonData: object): void {
    // ???????????????????????????????????????
    this.setCombinePickup(Object.keys(jsonData));

    // ??????????????? ????????? -> ?????????????????????????????? ??????????????????
    // this.disg.setDisgJson(jsonData, this.defList, this.combList, this.pickList);
    // this.reac.setReacJson(jsonData, this.defList, this.combList, this.pickList);
    this.fsec.setFsecJson(jsonData, this.defList, this.combList, this.pickList);
  }

  private setCombinePickup(load_keys: string[]): void {
    const load = this.load.getLoadNameJson(1);
    const define = this.define.getDefineJson();
    const combine = this.combine.getCombineJson();
    const pickup = this.pickup.getPickUpJson();

    // define ?????????
    this.defList = {};
    if (Object.keys(define).length > 0) {
      // define ???????????? ????????????
      for (const defNo of Object.keys(define)) {
        const d: object = define[defNo];
        const defines = new Array();
        for (const dKey of Object.keys(d)) {
          if (dKey === "row") {
            continue;
          }
          defines.push(d[dKey]);
        }
        this.defList[defNo] = defines;
      }
    } else {
      // define ??????????????????????????????????????????define??????????????????
      for (const caseNo of Object.keys(load)) {
        const n: number = this.helper.toNumber(caseNo);
        this.defList[caseNo] = n === null ? [] : [n];
      }
    }

    // ??????????????????????????????, define ??????????????????????????????
    for (const defNo of Object.keys(this.defList)) {
      const defines = new Array();
      for (const caseNo of this.defList[defNo]) {
        defines.push(caseNo);
        const strNo: string = Math.abs(caseNo).toString();
        if(!(strNo in load)){
          continue;
        }
        if(!('symbol' in load[strNo])){
          continue;
        }
        const symbol: string = load[strNo].symbol;
        if(symbol.includes('LL')){
          // ?????????????????????
          const target_LL_Keys: string[] = load_keys.filter(e =>{
            return e.indexOf(caseNo + ".") === 0;
          })
          for(const k of target_LL_Keys){
            defines.push(k);
          }
        }
      }
      this.defList[defNo] = defines;
    }

    // combine ?????????
    this.combList = {};
    for (const combNo of Object.keys(combine)) {
      const c: object = combine[combNo];
      const defines = new Array();
      for (const cKey of Object.keys(c)) {
        if (cKey === "row") {
          continue;
        }
        const caseNo: string = cKey.replace("C", "").replace("D", "");
        const coef: number = this.helper.toNumber(c[cKey]);
        if (!(caseNo in this.defList) || coef === null) {
          continue; // ?????????????????????
        }
        if ("C" + caseNo === cKey || "D" + caseNo === cKey) {
          defines.push({ caseNo, coef });
        }
      }
      if (defines.length > 0) {
        this.combList[combNo] = defines;
      }
    }

    // pickup ?????????
    this.pickList = {};
    for (const pickNo of Object.keys(pickup)) {
      const p: object = pickup[pickNo];
      const combines = new Array();
      for (const pKey of Object.keys(p)) {
        const caseNo: string = pKey.replace("C", "").replace("D", "");
        const comNo: number = this.helper.toNumber(p[pKey]);
        if (!(caseNo in this.combList) || comNo === null) {
          continue; // ?????????????????????
        }
        if ("C" + caseNo === pKey || "D" + caseNo === pKey) {
          combines.push(comNo);
        }
      }
      if (combines.length > 0) {
        this.pickList[pickNo] = combines;
      }
    }
  }

  // ????????????????????????????????????
  public GetPicUpText(): string {
    const p = this.pickfsec.fsecPickup;

    let result: string =
      "PickUpNo,???????????????,??????No,??????CaseNo,??????CaseNo,?????????,???????????????";
    result += ",??????Fx,??????Fy,??????Fz,??????Mx,??????My,??????Mz";
    result += ",??????Fx,??????Fy,??????Fz,??????Mx,??????My,??????Mz";
    result += "\n";

    for (let No = 1; No <= Object.keys(p).length; No++) {
      const c = p[No.toString()];
      const rows: number = Object.keys(c["fx_max"]).length;

      for (const symbol of ["fx", "fy", "fz", "mx", "my", "mz"]) {
        const maxList = c[symbol + "_max"];
        const minList = c[symbol + "_min"];

        let mNo: string;
        let point_counter: number = 0;
        let point_name: string = "";

        for (let row = 0; row < rows; row++) {
          // const r: string = row.toString();
          // if ( !(r in maxList) ){
          //   continue;
          // }
          const maxFsec = maxList[row];
          const minFsec = minList[row];

          // ???????????????????????????
          const mm: number = this.helper.toNumber(maxFsec.m);
          if (mm != null) {
            mNo = maxFsec.m;
          } else {
            console.log(mm);
          }

          // ???????????????????????????
          const nn: number = this.helper.toNumber(maxFsec.n);
          if (nn != null) {
            if (point_counter === 0) {
              point_name = "ITAN";
              point_counter += 1;
            } else {
              point_name = "JTAN";
              point_counter = 0;
            }
          } else {
            point_name = point_counter.toString();
            point_counter += 1;
          }

          result += No.toString();
          result += ",";
          result += symbol;
          result += ",";
          result += mNo;
          result += ",";
          result += maxFsec.comb;
          result += ",";
          result += minFsec.comb;
          result += ",";
          result += point_name;
          result += ",";
          result += maxFsec.l;
          result += ",";

          result += maxFsec.fx;
          result += ",";
          result += maxFsec.fy;
          result += ",";
          result += maxFsec.fz;
          result += ",";

          result += maxFsec.mx;
          result += ",";
          result += maxFsec.my;
          result += ",";
          result += maxFsec.mz;
          result += ",";

          result += minFsec.fx;
          result += ",";
          result += minFsec.fy;
          result += ",";
          result += minFsec.fz;
          result += ",";

          result += minFsec.mx;
          result += ",";
          result += minFsec.my;
          result += ",";
          result += minFsec.mz;

          result += "\n";
        }
      }
    }

    return result;
  }

  // ????????????????????????????????????
  public GetPicUpText2D(): string {
    const p = this.pickfsec.fsecPickup;

    let result: string =
      "PickUpNo,?????????,??????No,??????CaseNo,??????CaseNo,?????????,???????????????";
    result += ",??????Md,??????Vd,??????Nd";
    result += ",??????Md,??????Vd,??????Nd";
    result += "\n";

    for (let No = 1; No <= Object.keys(p).length; No++) {
      const c = p[No.toString()];
      const rows: number = Object.keys(c["fx_max"]).length;

      const key = ["M", "S", "N"];
      const symbol = ["mz", "fy", "fx"];

      for (let i = 0; i < symbol.length; i++) {
        const maxList = c[symbol[i] + "_max"];
        const minList = c[symbol[i] + "_min"];

        let mNo: string;
        let point_counter: number = 0;
        let point_name: string = "";

        for (let row = 0; row < rows; row++) {
          const r: string = row.toString();
          if (!(r in maxList)) {
            continue;
          }
          const maxFsec = maxList[row.toString()];
          const minFsec = minList[row.toString()];

          // ???????????????????????????
          const mm: number = this.helper.toNumber(maxFsec.m);
          if (mm != null) {
            mNo = maxFsec.m;
          } else {
            console.log(mm);
          }

          // ???????????????????????????
          const nn: number = this.helper.toNumber(maxFsec.n);
          if (nn != null) {
            if (point_counter === 0) {
              point_name = "ITAN";
              point_counter += 1;
            } else {
              point_name = "JTAN";
              point_counter = 0;
            }
          } else {
            point_name = point_counter.toString();
            point_counter += 1;
          }

          result += this.spacePadding(No.toString(), 5);
          result += this.spacePadding(key[i], 5);
          result += this.spacePadding(mNo, 5);
          result += this.spacePadding(maxFsec.comb, 5);
          result += this.spacePadding(minFsec.comb, 5);
          result += this.spacePadding(point_name, 5);
          result += this.spacePadding(maxFsec.l.toFixed(3), 10);

          result += this.spacePadding(maxFsec.mz.toFixed(2), 10);
          result += this.spacePadding(maxFsec.fy.toFixed(2), 10);
          result += this.spacePadding(maxFsec.fx.toFixed(2), 10);

          result += this.spacePadding(minFsec.mz.toFixed(2), 10);
          result += this.spacePadding(minFsec.fy.toFixed(2), 10);
          result += this.spacePadding(minFsec.fx.toFixed(2), 10);

          result += "\n";
        }
      }
    }

    return result;
  }

  private spacePadding(val, len) {
    for (var i = 0; i < len; i++) {
      val = " " + val;
    }
    return val.slice(-1 * len);
  }

  public getPickUpJson() {
    if (this.pickList == null) {
      // return this.InputData.define.getDefineJson();
      return this.InputData.pickup.getPickUpJson();
    }
    return this.pickList;
  }

  public getDefineJson() {
    if (this.defList == null) {
      return this.InputData.define.getDefineJson();
    }
    return this.defList;
  }

  public getCombineJson() {
    if (this.combList == null) {
      return this.InputData.combine.getCombineJson();
    }
    return this.combList;
  }
}
